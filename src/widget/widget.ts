import p5 from 'p5';
import { placeholderArtGenerator } from '../art-generators/placeholder';
import type { EntropySources } from '../art-generators/types';
import {
	type CanvasSizePreset,
	isValidWriting,
	listExportFormats,
	resolveCanvasSize,
} from '../lib/widget-core';

const generator = placeholderArtGenerator;

const writingInput = document.querySelector<HTMLTextAreaElement>('#writing')!;
const presetSelect = document.querySelector<HTMLSelectElement>('#canvas-preset')!;
const widthInput = document.querySelector<HTMLInputElement>('#canvas-width')!;
const heightInput = document.querySelector<HTMLInputElement>('#canvas-height')!;
const generateButton = document.querySelector<HTMLButtonElement>('#generate')!;
const exportJpgButton = document.querySelector<HTMLButtonElement>('#export-jpg')!;
const exportSvgButton = document.querySelector<HTMLButtonElement>('#export-svg')!;
const canvasContainer = document.querySelector<HTMLDivElement>('#canvas-container')!;
const errorMessage = document.querySelector<HTMLParagraphElement>('#error')!;

if (!listExportFormats(generator).includes('svg')) {
	exportSvgButton.hidden = true;
}

presetSelect.addEventListener('change', () => {
	const isCustom = presetSelect.value === 'custom';
	widthInput.hidden = !isCustom;
	heightInput.hidden = !isCustom;
});

function currentCanvasSize() {
	if (presetSelect.value === 'custom') {
		return resolveCanvasSize({
			width: Number(widthInput.value) || 0,
			height: Number(heightInput.value) || 0,
		});
	}
	return resolveCanvasSize(presetSelect.value as CanvasSizePreset);
}

function readEntropySources(sketch: p5): EntropySources {
	return {
		time: Date.now(),
		mousePosition: { x: sketch.mouseX, y: sketch.mouseY },
		viewportSize: { width: window.innerWidth, height: window.innerHeight },
	};
}

let sketchInstance: p5 | null = null;

generateButton.addEventListener('click', () => {
	const writing = writingInput.value;
	if (!isValidWriting(writing)) {
		errorMessage.textContent = 'Write something first.';
		return;
	}
	errorMessage.textContent = '';

	const size = currentCanvasSize();

	sketchInstance?.remove();
	sketchInstance = new p5((sketch: p5) => {
		sketch.setup = () => {
			sketch.createCanvas(size.width, size.height);
			sketch.noLoop();
		};
		sketch.draw = () => {
			generator.draw(sketch, writing, size, readEntropySources(sketch));
		};
	}, canvasContainer);
});

exportJpgButton.addEventListener('click', () => {
	sketchInstance?.saveCanvas('expresion-catartica', 'jpg');
});
