import type p5 from 'p5';
import type { CanvasSize } from '../lib/widget-core';

export type EntropySources = {
	time: number;
	mousePosition: { x: number; y: number };
	viewportSize: { width: number; height: number };
};

// Colors of a finished artwork. The page uses them to match its own colors.
export type ArtPalette = { background: string; stroke: string };

export interface ArtGenerator {
	readonly supportsSvgExport: boolean;
	draw(p: p5, writing: string, size: CanvasSize, entropy: EntropySources): ArtPalette | void;
}
