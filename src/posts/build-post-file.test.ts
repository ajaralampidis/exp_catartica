import { describe, expect, it } from 'vitest';
import { buildPostFile } from './build-post-file.ts';

describe('buildPostFile', () => {
	it('puts the ArtGenerator in the front matter and the Writing in the body', () => {
		const file = buildPostFile({ artGenerator: 'nested-squares', writing: 'hola\nmundo' }, 'abc');
		expect(file).toEqual({
			id: 'abc',
			path: 'posts/abc.md',
			content: '---\nartGenerator: nested-squares\n---\nhola\nmundo\n',
		});
	});

	it('makes a different id for each call', () => {
		const post = { artGenerator: 'nested-squares', writing: 'x' } as const;
		expect(buildPostFile(post).id).not.toBe(buildPostFile(post).id);
	});

	it('makes ids that sort by time', () => {
		expect(buildPostFile({ artGenerator: 'nested-squares', writing: 'x' }).id).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[0-9a-f]{8}$/);
	});
});
