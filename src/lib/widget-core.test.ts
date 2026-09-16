import { describe, expect, it } from 'vitest';
import { isValidWriting, listExportFormats, resolveCanvasSize } from './widget-core';

describe('isValidWriting', () => {
	it('rejects an empty string', () => {
		expect(isValidWriting('')).toBe(false);
	});

	it('rejects whitespace-only writing', () => {
		expect(isValidWriting('   \n\t  ')).toBe(false);
	});

	it('accepts a single character', () => {
		expect(isValidWriting('a')).toBe(true);
	});

	it('accepts writing with line breaks', () => {
		expect(isValidWriting('line one\nline two')).toBe(true);
	});

	it('accepts emoji', () => {
		expect(isValidWriting('😀')).toBe(true);
	});
});

describe('resolveCanvasSize', () => {
	it('resolves the square preset', () => {
		expect(resolveCanvasSize('square')).toEqual({ width: 1080, height: 1080 });
	});

	it('resolves the portrait preset', () => {
		expect(resolveCanvasSize('portrait')).toEqual({ width: 1080, height: 1350 });
	});

	it('resolves the story preset', () => {
		expect(resolveCanvasSize('story')).toEqual({ width: 1080, height: 1920 });
	});

	it('passes a custom size through unchanged', () => {
		expect(resolveCanvasSize({ width: 500, height: 333 })).toEqual({ width: 500, height: 333 });
	});
});

describe('listExportFormats', () => {
	it('lists only jpg for a generator without SVG support', () => {
		expect(listExportFormats({ supportsSvgExport: false })).toEqual(['jpg']);
	});

	it('lists jpg and svg for a generator with SVG support', () => {
		expect(listExportFormats({ supportsSvgExport: true })).toEqual(['jpg', 'svg']);
	});
});
