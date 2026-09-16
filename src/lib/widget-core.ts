export type CanvasSizePreset = 'square' | 'portrait' | 'story';

export type CanvasSize = { width: number; height: number };

export const CANVAS_PRESETS: Record<CanvasSizePreset, CanvasSize> = {
	square: { width: 1080, height: 1080 },
	portrait: { width: 1080, height: 1350 },
	story: { width: 1080, height: 1920 },
};

export function resolveCanvasSize(input: CanvasSizePreset | CanvasSize): CanvasSize {
	if (typeof input === 'string') {
		return CANVAS_PRESETS[input];
	}
	return input;
}

export function isValidWriting(writing: string): boolean {
	return writing.trim().length > 0;
}

export type ExportFormat = 'jpg' | 'svg';

export function listExportFormats(generator: { supportsSvgExport: boolean }): ExportFormat[] {
	return generator.supportsSvgExport ? ['jpg', 'svg'] : ['jpg'];
}
