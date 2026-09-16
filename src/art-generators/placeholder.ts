import type { ArtGenerator } from './types';

const LINES_PER_LETTER = 100;
const FONT_STACK = 'Georgia, "Times New Roman", serif';

function hashText(text: string): number {
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		hash = (hash * 31 + text.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

// Proves the Widget -> Generate -> Canvas -> Export pipeline. Not a design.
export const placeholderArtGenerator: ArtGenerator = {
	supportsSvgExport: false,
	draw(p, writing, size, entropy) {
		const chars = Array.from(writing).filter((char) => char !== '\n' && char !== '\r');
		if (chars.length === 0) return;

		const textHash = hashText(writing);
		const baseHue = textHash % 360;

		p.colorMode(p.HSB, 360, 100, 100, 1);
		p.background(baseHue, 10, 97);
		p.randomSeed(textHash + entropy.time);
		p.textFont(FONT_STACK);
		p.textAlign(p.CENTER, p.CENTER);

		const columnWidth = size.width / chars.length;

		chars.forEach((char, i) => {
			const columnX = i * columnWidth;
			const hueOffset = ((char.codePointAt(0) ?? 0) % 60) - 30;
			const hue = (baseHue + hueOffset + 360) % 360;

			for (let l = 0; l < LINES_PER_LETTER; l++) {
				const x = columnX + p.random(columnWidth);
				const lineHue = (hue + p.random(-20, 20) + 360) % 360;
				p.stroke(lineHue, p.random(40, 90), p.random(50, 100), p.random(0.05, 0.5));
				p.strokeWeight(p.random(0.5, 1.5));
				p.line(x, 0, x, size.height);
			}

			if (char.trim().length > 0) {
				const fontSize = Math.min(columnWidth * 1.6, size.height * 0.6);
				p.noStroke();
				p.textSize(fontSize);
				p.fill(baseHue, 15, 12, 0.85);
				p.text(char, columnX + columnWidth / 2, size.height / 2);
			}
		});
	},
};
