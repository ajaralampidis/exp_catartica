import type p5 from 'p5';
import { nestedSquaresArtGenerator } from '../art-generators/nested-squares/nested-squares';
import { sketchArt } from '../art-generators/sketch-art';
import type { ArtPalette } from '../art-generators/types';
import { isValidWriting } from '../lib/widget-core';

const generator = nestedSquaresArtGenerator;
const DEBOUNCE_MS = 3000;
const MIN_FONT_SIZE = 12; // px

const stage = document.querySelector<HTMLElement>('main')!;
const writingInput = document.querySelector<HTMLTextAreaElement>('#writing')!;
const canvasContainer = document.querySelector<HTMLDivElement>('#canvas-container')!;
const baseFontSize = parseFloat(getComputedStyle(writingInput).fontSize);

// The textarea grows with its text up to its max height. After that the text
// shrinks to fit, but never below MIN_FONT_SIZE. Past that it scrolls.
function fitText() {
	let size = baseFontSize;
	writingInput.style.fontSize = `${size}px`;
	while (writingInput.scrollHeight > writingInput.clientHeight && size > MIN_FONT_SIZE) {
		size -= 1;
		writingInput.style.fontSize = `${size}px`;
	}
}

// Gives the page the colors of the artwork, over whatever theme is on. Without
// a palette the theme's own colors come back.
function matchTheme(palette?: ArtPalette | void) {
	const style = document.documentElement.style;
	if (palette) {
		style.setProperty('--color-base-100', palette.background);
		style.setProperty('--color-base-content', palette.stroke);
	} else {
		style.removeProperty('--color-base-100');
		style.removeProperty('--color-base-content');
	}
}

let sketchInstance: p5 | null = null;
let lastWriting = '';
let typingTimer: number | undefined;

function generate() {
	const writing = writingInput.value;
	if (writing !== lastWriting) {
		lastWriting = writing;
		sketchInstance?.remove();
		sketchInstance = null;
		if (isValidWriting(writing)) {
			sketchInstance = sketchArt(canvasContainer, generator, writing, matchTheme);
		} else {
			matchTheme();
		}
	}
	stage.toggleAttribute('data-art', sketchInstance !== null);
}

// The art goes stale once the text changes. It is generated when typing stops,
// or right away if the textarea loses focus. The textarea keeps its focus.
writingInput.addEventListener('input', () => {
	fitText();
	stage.toggleAttribute('data-art', false);
	clearTimeout(typingTimer);
	typingTimer = window.setTimeout(generate, DEBOUNCE_MS);
});
writingInput.addEventListener('blur', () => {
	clearTimeout(typingTimer);
	generate();
});
window.addEventListener('resize', fitText);
