import type p5 from 'p5';
import { artGenerators, type ArtGeneratorName } from '../art-generators/registry';
import { matchTheme } from '../art-generators/match-theme';
import { sketchArt } from '../art-generators/sketch-art';
import { isValidWriting } from '../lib/widget-core';
import { save } from './save';

const artGenerator: ArtGeneratorName = 'nested-squares';
const generator = artGenerators[artGenerator];
const DEBOUNCE_MS = 3000;
const MIN_FONT_SIZE = 12; // px

const stage = document.querySelector<HTMLElement>('main')!;
const writingInput = document.querySelector<HTMLTextAreaElement>('#writing')!;
const canvasContainer = document.querySelector<HTMLDivElement>('#canvas-container')!;
const saveButton = document.querySelector<HTMLButtonElement>('#save')!;
const saveModal = document.querySelector<HTMLDialogElement>('#save-modal')!;
const saveForm = document.querySelector<HTMLFormElement>('#save-form')!;
const secretPhraseInput = document.querySelector<HTMLInputElement>('#secret-phrase')!;
const saveSubmitButton = document.querySelector<HTMLButtonElement>('#save-form button')!;
const saveResult = document.querySelector<HTMLElement>('#save-result')!;
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
// Save stays off until there is Writing to save.
function syncSaveButton() {
	saveButton.disabled = !isValidWriting(writingInput.value);
}

writingInput.addEventListener('input', () => {
	fitText();
	syncSaveButton();
	stage.toggleAttribute('data-art', false);
	clearTimeout(typingTimer);
	typingTimer = window.setTimeout(generate, DEBOUNCE_MS);
});
writingInput.addEventListener('blur', () => {
	clearTimeout(typingTimer);
	generate();
});
window.addEventListener('resize', fitText);
syncSaveButton();

saveButton.addEventListener('click', () => {
	saveResult.textContent = '';
	saveModal.showModal();
});

saveForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	saveSubmitButton.disabled = true;
	saveResult.textContent = 'Saving...';
	saveResult.textContent = await save(artGenerator, writingInput.value, secretPhraseInput.value);
	saveSubmitButton.disabled = false;
});
