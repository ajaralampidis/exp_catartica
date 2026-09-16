import type { ArtGenerator } from './types';

// Proves the Widget -> Generate -> Canvas -> Export pipeline. Not a design.
export const placeholderArtGenerator: ArtGenerator = {
	supportsSvgExport: false,
	draw(p, writing, size, entropy) {
		p.colorMode(p.HSB, 360, 100, 100, 1);
		p.background((entropy.time / 20) % 360, 20, 95);
		p.noStroke();

		const seed = entropy.time + entropy.mousePosition.x + entropy.mousePosition.y;

		Array.from(writing).forEach((char, i) => {
			const code = char.codePointAt(0) ?? 0;
			const x = (code * (i + 1) + seed) % size.width;
			const y = (code * (i + 7) + seed * 1.3) % size.height;
			const diameter = 8 + (code % 40);
			const hue = (code + seed / 10) % 360;

			p.fill(hue, 70, 70, 0.8);
			p.circle(x, y, diameter);
		});
	},
};
