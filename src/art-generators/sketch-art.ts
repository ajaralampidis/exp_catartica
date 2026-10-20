import p5 from 'p5';
import type { ArtGenerator, ArtPalette, EntropySources } from './types.ts';

function readEntropySources(sketch: p5): EntropySources {
	return {
		time: Date.now(),
		mousePosition: { x: sketch.mouseX, y: sketch.mouseY },
		viewportSize: { width: window.innerWidth, height: window.innerHeight },
	};
}

// Draws the Writing once on a Canvas that fills `container`. Call `remove()` on
// the result to take the Canvas away.
export function sketchArt(
	container: HTMLElement,
	generator: ArtGenerator,
	writing: string,
	onDraw?: (palette: ArtPalette | void) => void,
): p5 {
	const size = { width: container.clientWidth, height: container.clientHeight };
	return new p5((sketch: p5) => {
		sketch.setup = () => {
			sketch.createCanvas(size.width, size.height);
			sketch.noLoop();
		};
		sketch.draw = () => {
			const palette = generator.draw(sketch, writing, size, readEntropySources(sketch));
			onDraw?.(palette);
		};
	}, container);
}
