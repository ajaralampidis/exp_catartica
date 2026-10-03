import type p5 from 'p5';
import { describe, expect, it } from 'vitest';
import {
	backgroundColor,
	gridFor,
	hasLightLines,
	hsl,
	hueStep,
	mostReadableHue,
	nestedSquaresArtGenerator,
	squareCount,
	squareHue,
	strokeWidth,
} from './nested-squares';

const hslOf = (color: string) => color.match(/hsl\((\d+), (\d+)%, (\d+)%\)/)!.slice(1).map(Number);
const letters = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
// Signed distance from hue a to hue b on the color wheel, in -180..180.
const hueGap = (a: number, b: number) => ((b - a + 540) % 360) - 180;

describe('hueStep', () => {
	it('moves between 6 and 30 degrees', () => {
		for (const char of letters) {
			for (const length of [1, 28, 140]) {
				expect(Math.abs(hueStep(char, length))).toBeGreaterThanOrEqual(6);
				expect(Math.abs(hueStep(char, length))).toBeLessThanOrEqual(30);
			}
		}
	});

	it('goes up for some characters and down for others', () => {
		const steps = letters.map((char) => hueStep(char, 28));
		expect(steps.some((step) => step > 0)).toBe(true);
		expect(steps.some((step) => step < 0)).toBe(true);
	});

	it('changes with the text length', () => {
		const lengths = Array.from({ length: 40 }, (_, i) => i + 1);
		expect(new Set(lengths.map((length) => hueStep('a', length))).size).toBeGreaterThan(10);
	});

	it('is the same for the same character and length', () => {
		expect(hueStep('a', 28)).toBe(hueStep('a', 28));
	});
});

describe('squareHue', () => {
	it('keeps the hue in the color wheel', () => {
		for (const char of [...letters, 'ñ', '😀', ' ']) {
			for (let k = 0; k < 8; k++) {
				expect(squareHue(char, 28, k)).toBeGreaterThanOrEqual(0);
				expect(squareHue(char, 28, k)).toBeLessThan(360);
			}
		}
	});

	it('gives different outer hues to neighbouring characters', () => {
		expect(squareHue('a', 28, 0)).not.toBeCloseTo(squareHue('b', 28, 0));
	});

	it('moves every inner square one step from the previous one', () => {
		for (const char of letters) {
			const step = hueStep(char, 28);
			for (let k = 1; k < 8; k++) {
				expect(hueGap(squareHue(char, 28, k - 1), squareHue(char, 28, k))).toBeCloseTo(step);
			}
		}
	});
});

describe('hasLightLines', () => {
	// Characters whose rounded hue is odd or even.
	const odd = letters.find((char) => Math.round(squareHue(char, 1, 0)) % 2 === 1)!;
	const even = letters.find((char) => Math.round(squareHue(char, 1, 0)) % 2 === 0)!;

	it('is true when the sum of the characters hues is odd', () => {
		expect(hasLightLines([odd])).toBe(true);
		expect(hasLightLines([odd, even])).toBe(true);
	});

	it('is false when the sum is even', () => {
		expect(hasLightLines([even])).toBe(false);
		expect(hasLightLines([odd, odd])).toBe(false);
	});

	it('flips when one odd character is added to a text', () => {
		const text = Array.from('La catarsis es una limpieza.');
		expect(hasLightLines([...text, odd])).toBe(!hasLightLines(text));
	});

	it('depends on the characters, not on the text length', () => {
		expect(hasLightLines([odd, even])).not.toBe(hasLightLines([even, even]));
	});
});

describe('hsl', () => {
	it('rounds the hue', () => {
		expect(hslOf(hsl(200.4, 70, true))[0]).toBe(200);
	});

	it('keeps the lines saturated: the text length, within 60..90', () => {
		for (const light of [true, false]) {
			expect(hslOf(hsl(0, 3, light))[1]).toBe(60);
			expect(hslOf(hsl(0, 70, light))[1]).toBe(70);
			expect(hslOf(hsl(0, 500, light))[1]).toBe(90);
		}
	});

	it('keeps light lines within lightness 55..80', () => {
		expect(hslOf(hsl(0, 3, true))[2]).toBe(55);
		expect(hslOf(hsl(0, 70, true))[2]).toBe(70);
		expect(hslOf(hsl(0, 500, true))[2]).toBe(80);
	});

	it('keeps dark lines within lightness 25..40', () => {
		expect(hslOf(hsl(0, 3, false))[2]).toBe(25);
		expect(hslOf(hsl(0, 30, false))[2]).toBe(30);
		expect(hslOf(hsl(0, 500, false))[2]).toBe(40);
	});
});

describe('mostReadableHue', () => {
	const hues = [0, 60, 120, 180, 240, 300];

	it('picks the brightest hue for light lines on a dark background', () => {
		expect(mostReadableHue(hues, 60, true)).toBe(60);
	});

	it('picks the darkest hue for dark lines on a light background', () => {
		expect(mostReadableHue(hues, 20, false)).toBe(240);
	});

	it('picks one of the given hues', () => {
		expect([10, 200, 330]).toContain(mostReadableHue([10, 200, 330], 40, true));
	});
});

describe('backgroundColor', () => {
	it('is dark behind light lines', () => {
		expect(hslOf(backgroundColor([0], true))[2]).toBe(12);
	});

	it('is light behind dark lines', () => {
		expect(hslOf(backgroundColor([0], false))[2]).toBe(92);
	});

	it('stays desaturated', () => {
		expect(hslOf(backgroundColor([0], true))[1]).toBe(40);
		expect(hslOf(backgroundColor([0], false))[1]).toBe(40);
	});

	it('is cool when most squares are warm', () => {
		expect(hslOf(backgroundColor([0, 30, 60], false))[0]).toBe(225);
	});

	it('is warm when most squares are cool', () => {
		expect(hslOf(backgroundColor([180, 240, 270], false))[0]).toBe(25);
	});

	it('follows the majority', () => {
		expect(hslOf(backgroundColor([0, 30, 60, 180, 240], false))[0]).toBe(225);
		expect(hslOf(backgroundColor([0, 30, 180, 200, 240], false))[0]).toBe(25);
	});

	it('counts reds on both sides of the color wheel as warm', () => {
		expect(hslOf(backgroundColor([350, 10, 20, 200], false))[0]).toBe(225);
	});
});

describe('strokeWidth', () => {
	it('is at least 1px', () => {
		expect(strokeWidth('a', 0, 3, 10)).toBe(1);
	});

	it('stays between 1/200 and 1/10 of the square side', () => {
		for (const char of letters) {
			for (let k = 0; k < 8; k++) {
				expect(strokeWidth(char, k, 8, 480)).toBeGreaterThanOrEqual(2.4);
				expect(strokeWidth(char, k, 8, 480)).toBeLessThanOrEqual(48);
			}
		}
	});

	it('goes from hairlines to very thick lines', () => {
		const widths = letters.flatMap((char) => Array.from({ length: 8 }, (_, k) => strokeWidth(char, k, 8, 480)));
		expect(Math.max(...widths) / Math.min(...widths)).toBeGreaterThan(10);
	});

	it('varies from square to square', () => {
		const widths = Array.from({ length: 8 }, (_, k) => strokeWidth('a', k, 8, 480));
		expect(new Set(widths).size).toBeGreaterThan(4);
	});

	it('varies from character to character', () => {
		expect(new Set(letters.map((char) => strokeWidth(char, 0, 4, 480))).size).toBeGreaterThan(40);
	});

	it('is the same for the same square', () => {
		expect(strokeWidth('a', 2, 5, 480)).toBe(strokeWidth('a', 2, 5, 480));
	});
});

describe('squareCount', () => {
	const countsOf = (text: string) => Array.from(text).map((char, i, chars) => squareCount(char, i, chars.length));
	const text = 'La catarsis es una limpieza.';

	it('gives the same counts to the same text', () => {
		expect(countsOf(text)).toEqual(countsOf(text));
	});

	it('stays within 1..8', () => {
		expect(countsOf(text.repeat(50)).every((count) => count >= 1 && count <= 8)).toBe(true);
	});

	it('reaches every count from 1 to 8', () => {
		expect(new Set(countsOf(text.repeat(50)))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
	});

	it('does not follow the position in the text', () => {
		const counts = countsOf(text);
		expect(counts).not.toEqual([...counts].sort((a, b) => a - b));
	});

	it('changes with the characters', () => {
		expect(countsOf('abcdefghijkl')).not.toEqual(countsOf('mnopqrstuvwx'));
	});

	it('changes with the text length', () => {
		expect(countsOf('abcdefghij')).not.toEqual(countsOf('abcdefghijk').slice(0, 10));
	});

	it('spreads the counts evenly', () => {
		const counts = countsOf(text.repeat(200));
		for (let n = 1; n <= 8; n++) {
			const share = counts.filter((count) => count === n).length / counts.length;
			expect(share).toBeGreaterThan(0.09);
			expect(share).toBeLessThan(0.16);
		}
	});
});

describe('gridFor', () => {
	const size = { width: 1264, height: 495 };

	it('uses one cell for one character', () => {
		expect(gridFor(1, size)).toEqual({ cols: 1, rows: 1, side: 495 });
	});

	it('lays two characters side by side on a wide canvas', () => {
		expect(gridFor(2, size)).toMatchObject({ cols: 2, rows: 1 });
	});

	it('stacks two characters on a tall canvas', () => {
		expect(gridFor(2, { width: 390, height: 600 })).toMatchObject({ cols: 1, rows: 2 });
	});

	it('has a cell for every character and the biggest square that fits', () => {
		const { cols, rows, side } = gridFor(28, size);
		expect(cols * rows).toBeGreaterThanOrEqual(28);
		expect(side).toBe(Math.min(size.width / cols, size.height / rows));
		expect(side).toBeGreaterThanOrEqual(Math.min(size.width / 9, size.height / 4));
	});
});

describe('nestedSquaresArtGenerator', () => {
	const size = { width: 1264, height: 558 };
	const entropy = { time: 0, mousePosition: { x: 0, y: 0 }, viewportSize: { width: 0, height: 0 } };

	// Draws on a fake p5 that records what it was asked to paint.
	const run = (writing: string) => {
		const centres = new Set<string>();
		const strokes: string[] = [];
		const backgrounds: string[] = [];
		const p = {
			background: (color: string) => backgrounds.push(color),
			noFill() {},
			stroke: (color: string) => strokes.push(color),
			strokeWeight() {},
			square: (x: number, y: number, side: number) => centres.add(`${Math.round(x + side / 2)},${Math.round(y + side / 2)}`),
		} as unknown as p5;
		const palette = nestedSquaresArtGenerator.draw(p, writing, size, entropy);
		// The centre of every cell that got a square (nested squares share a centre).
		return { cells: centres.size, strokes, backgrounds, palette };
	};

	it('draws a square in every cell when the text fills the grid', () => {
		const { cols, rows } = gridFor(28, size);
		expect(cols * rows).toBe(28);
		expect(run('La catarsis es una limpieza.').cells).toBe(28);
	});

	it('repeats the text to fill the last row, leaving no cell empty', () => {
		const { cols, rows } = gridFor(29, size);
		expect(cols * rows).toBeGreaterThan(29);
		expect(run('La catarsis es una limpieza.!').cells).toBe(cols * rows);
	});

	it('draws nothing, and has no palette, for an empty text', () => {
		const { cells, palette } = run('\n');
		expect(cells).toBe(0);
		expect(palette).toBeUndefined();
	});

	it('returns its background and one of the stroke colors it drew', () => {
		const { backgrounds, strokes, palette } = run('La catarsis es una limpieza.');
		expect(palette).toBeDefined();
		expect(palette!.background).toBe(backgrounds[0]);
		expect(strokes).toContain(palette!.stroke);
	});

	it('returns the same palette for the same text', () => {
		expect(run('La catarsis es una limpieza.').palette).toEqual(run('La catarsis es una limpieza.').palette);
	});
});
