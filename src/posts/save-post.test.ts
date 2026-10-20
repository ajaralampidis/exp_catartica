import { describe, expect, it, vi } from 'vitest';
import type { GitHubConfig } from '../github/config.ts';
import { parsePostFile } from './parse-post-file.ts';
import { savePost } from './save-post.ts';

describe('savePost', () => {
	it('commits a file that parsePostFile reads back', async () => {
		const fetchMock = vi.fn(async () => Response.json({ commit: { sha: 'abc', html_url: 'https://github.com/o/r/commit/abc' } }, { status: 201 }));
		const config: GitHubConfig = { token: 't', owner: 'o', repo: 'r', fetch: fetchMock as unknown as typeof fetch };
		const post = { artGenerator: 'nested-squares', writing: 'hola\nmundo' } as const;

		const saved = await savePost(post, config);

		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		const body = JSON.parse(init.body as string);
		expect(url).toBe(`https://api.github.com/repos/o/r/contents/posts/${saved.id}.md`);
		expect(body.message).toBe(`Add post ${saved.id}`);
		expect(parsePostFile(Buffer.from(body.content, 'base64').toString('utf8'))).toEqual(post);
		expect(saved).toMatchObject({ commitSha: 'abc', commitUrl: 'https://github.com/o/r/commit/abc' });
	});
});
