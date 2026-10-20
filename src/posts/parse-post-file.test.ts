import { describe, expect, it } from 'vitest';
import { buildPostFile } from './build-post-file.ts';
import { parsePostFile } from './parse-post-file.ts';
import type { Post } from './post.ts';

const roundTrip = (post: Post) => parsePostFile(buildPostFile(post).content);

describe('parsePostFile', () => {
	it('reads back what buildPostFile wrote', () => {
		const post: Post = { artGenerator: 'nested-squares', writing: 'hola mundo' };
		expect(roundTrip(post)).toEqual(post);
	});

	it('keeps line breaks, accents and emoji', () => {
		const post: Post = { artGenerator: 'nested-squares', writing: 'línea uno\n\nlínea dos 😀\n' };
		expect(roundTrip(post)).toEqual(post);
	});

	it('keeps a Writing that looks like front matter', () => {
		const post: Post = { artGenerator: 'nested-squares', writing: '---\nartGenerator: other\n---' };
		expect(roundTrip(post)).toEqual(post);
	});

	it('rejects a file without front matter', () => {
		expect(() => parsePostFile('just text\n')).toThrow('Not a Post file');
	});

	it('rejects an unknown ArtGenerator', () => {
		expect(() => parsePostFile('---\nartGenerator: toString\n---\nhi\n')).toThrow('Unknown ArtGenerator "toString"');
	});
});
