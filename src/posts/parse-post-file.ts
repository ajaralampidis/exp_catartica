import { isArtGeneratorName } from '../art-generators/registry.ts';
import type { Post } from './post.ts';

const POST_FILE = /^---\nartGenerator: (.+)\n---\n([\s\S]*)\n$/;

// Reads a file made by `buildPostFile`. Throws if the file is not a Post.
export function parsePostFile(source: string): Post {
	const [, artGenerator, writing] = POST_FILE.exec(source) ?? [];
	if (writing === undefined) throw new Error('Not a Post file');
	if (!isArtGeneratorName(artGenerator)) throw new Error(`Unknown ArtGenerator "${artGenerator}"`);
	return { artGenerator, writing };
}
