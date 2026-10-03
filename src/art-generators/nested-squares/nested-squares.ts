import type { CanvasSize } from '../../lib/widget-core';
import type { ArtGenerator } from '../types';

const MAX_SQUARES = 8;
const FILL = 0.8; // square side as a share of its grid cell
const HUE_STEP = { min: 6, max: 30 }; // degrees between nested squares
const STROKE = { min: 1 / 200, max: 1 / 10 }; // share of the square's side
const SALT = { count: 1, hueStep: 2, stroke: 3 }; // keeps the hashes of each feature apart

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function codeOf(char: string): number {
	return char.codePointAt(0) ?? 0;
}

// Integer hash (MurmurHash3's final mix). Erratic, yet the same input always
// gives the same number on every device, so the same text gives the same art.
function hash(...values: number[]): number {
	let h = 0;
	for (const value of values) {
		h = Math.imul(h ^ value, 0x9e3779b1);
		h ^= h >>> 16;
		h = Math.imul(h, 0x85ebca6b);
		h ^= h >>> 13;
		h = Math.imul(h, 0xc2b2ae35);
		h ^= h >>> 16;
	}
	return h >>> 0;
}

// Squares nested in one character, 1..8.
export function squareCount(char: string, index: number, total: number): number {
	return (hash(SALT.count, codeOf(char), index, total) % MAX_SQUARES) + 1;
}

// Degrees to move the hue from one nested square to the next, up or down.
// Both the size and the direction depend on the character and the text length.
export function hueStep(char: string, textLength: number): number {
	const h = hash(SALT.hueStep, codeOf(char), textLength);
	const size = HUE_STEP.min + (h % (HUE_STEP.max - HUE_STEP.min + 1));
	return h & 0x10000 ? size : -size;
}

// Hue of a character's outer square: the golden angle spreads neighbouring codes far apart.
function charHue(char: string): number {
	return (codeOf(char) * 137.508) % 360;
}

// Hue of the k-th square of a character, 0 being the outer one.
export function squareHue(char: string, textLength: number, k: number): number {
	const hue = charHue(char) + k * hueStep(char, textLength);
	return ((hue % 360) + 360) % 360;
}

// Light lines on a dark background when the sum of the characters' hues is odd,
// dark lines on a light background when it is even. Hard to predict from the text.
export function hasLightLines(chars: string[]): boolean {
	return chars.reduce((sum, char) => sum + Math.round(charHue(char)), 0) % 2 === 1;
}

// The lines are always saturated, more so as the text grows. The lightness stays
// in a light or a dark range, so the lines contrast with the background.
function tone(textLength: number, light: boolean) {
	return {
		saturation: clamp(textLength, 60, 90),
		lightness: light ? clamp(textLength, 55, 80) : clamp(textLength, 25, 40),
	};
}

export function hsl(hue: number, textLength: number, light: boolean): string {
	const { saturation, lightness } = tone(textLength, light);
	return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

// WCAG relative luminance of an hsl() color.
function luminance(hue: number, saturation: number, lightness: number): number {
	const s = saturation / 100;
	const l = lightness / 100;
	const channel = (n: number) => {
		const k = (n + hue / 30) % 12;
		const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4);
}

// The hue that contrasts most with the background: the brightest stroke on a
// dark background, the darkest one on a light background.
export function mostReadableHue(hues: number[], textLength: number, light: boolean): number {
	const { saturation, lightness } = tone(textLength, light);
	const brightness = (hue: number) => luminance(hue, saturation, lightness) * (light ? 1 : -1);
	return hues.reduce((best, hue) => (brightness(hue) > brightness(best) ? hue : best));
}

// Reds, oranges and yellows: the cosine is positive from magenta to green.
function isWarm(hue: number): boolean {
	return Math.cos(((hue - 30) * Math.PI) / 180) > 0;
}

// A desaturated background: dark behind light lines, light behind dark lines. Its
// temperature is the opposite of most squares, so they stand out.
export function backgroundColor(hues: number[], light: boolean): string {
	const mostlyWarm = hues.filter(isWarm).length > hues.length / 2;
	return `hsl(${mostlyWarm ? 225 : 25}, 40%, ${light ? 12 : 92}%)`;
}

// Stroke width of the k-th square among `count`: erratic, a share of the square's side.
export function strokeWidth(char: string, k: number, count: number, side: number): number {
	const share = hash(SALT.stroke, codeOf(char), k, count) / 2 ** 32;
	return Math.max(1, side * (STROKE.min + share * (STROKE.max - STROKE.min)));
}

// Picks the column count that makes the squares biggest. `side` is the
// biggest square that fits a cell, so the gap grows along the other axis.
// The grid can have more cells than the text has characters.
export function gridFor(count: number, { width, height }: CanvasSize) {
	let best = { cols: 1, rows: count, side: 0 };
	for (let cols = 1; cols <= count; cols++) {
		const rows = Math.ceil(count / cols);
		const side = Math.min(width / cols, height / rows);
		if (side > best.side) best = { cols, rows, side };
	}
	return best;
}

// One outlined square per character, with smaller squares nested inside.
export const nestedSquaresArtGenerator: ArtGenerator = {
	supportsSvgExport: false,
	draw(p, writing, size) {
		const chars = Array.from(writing).filter((char) => char !== '\n' && char !== '\r');
		if (chars.length === 0) return;

		const total = chars.length;
		const light = hasLightLines(chars);
		const { cols, rows, side: cell } = gridFor(total, size);
		const cellWidth = size.width / cols;
		const cellHeight = size.height / rows;
		const side = cell * FILL;

		// Cells the text does not reach repeat it from the start, so the grid has no gaps.
		const glyphs = Array.from({ length: cols * rows }, (_cell, i) => {
			const char = chars[i % total];
			const count = squareCount(char, i, total);
			return { char, hues: Array.from({ length: count }, (_square, k) => squareHue(char, total, k)) };
		});
		const hues = glyphs.flatMap((glyph) => glyph.hues);
		const background = backgroundColor(hues, light);

		p.background(background);
		p.noFill();
		glyphs.forEach((glyph, i) => {
			const left = (i % cols) * cellWidth + (cellWidth - side) / 2;
			const top = Math.floor(i / cols) * cellHeight + (cellHeight - side) / 2;
			glyph.hues.forEach((hue, k) => {
				const inset = (k * side) / (2 * glyph.hues.length);
				p.stroke(hsl(hue, total, light));
				p.strokeWeight(strokeWidth(glyph.char, k, glyph.hues.length, side));
				p.square(left + inset, top + inset, side - 2 * inset);
			});
		});

		return { background, stroke: hsl(mostReadableHue(hues, total, light), total, light) };
	},
};
