import { nestedSquaresArtGenerator } from './nested-squares/nested-squares.ts';
import type { ArtGenerator } from './types.ts';

// Every ArtGenerator a Post can name. Add new ones here.
export const artGenerators = {
	'nested-squares': nestedSquaresArtGenerator,
} satisfies Record<string, ArtGenerator>;

export type ArtGeneratorName = keyof typeof artGenerators;

export function isArtGeneratorName(name: string): name is ArtGeneratorName {
	return Object.hasOwn(artGenerators, name);
}
