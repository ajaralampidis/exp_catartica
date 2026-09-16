import type p5 from 'p5';
import type { CanvasSize } from '../lib/widget-core';

export type EntropySources = {
	time: number;
	mousePosition: { x: number; y: number };
	viewportSize: { width: number; height: number };
};

export interface ArtGenerator {
	readonly supportsSvgExport: boolean;
	draw(p: p5, writing: string, size: CanvasSize, entropy: EntropySources): void;
}
