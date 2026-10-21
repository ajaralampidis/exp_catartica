import type { ArtPalette } from './types.ts';

// Gives the page the colors of the artwork, over whatever theme is on. Without
// a palette the theme's own colors come back.
export function matchTheme(palette?: ArtPalette | void) {
	const style = document.documentElement.style;
	if (palette) {
		style.setProperty('--color-base-100', palette.background);
		style.setProperty('--color-base-content', palette.stroke);
	} else {
		style.removeProperty('--color-base-100');
		style.removeProperty('--color-base-content');
	}
}
