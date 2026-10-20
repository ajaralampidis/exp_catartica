import { describe, expect, it, vi } from 'vitest';
import type { GitHubConfig } from './config.ts';
import { createFile } from './contents.ts';

const created = { commit: { sha: 'abc123', html_url: 'https://github.com/o/r/commit/abc123' } };

function configWith(branch?: string) {
	const fetchMock = vi.fn(async () => Response.json(created, { status: 201 }));
	const config: GitHubConfig = { token: 't', owner: 'o', repo: 'r', branch, fetch: fetchMock as unknown as typeof fetch };
	return { config, fetchMock };
}

describe('createFile', () => {
	it('PUTs the base64 content with the message and the branch', async () => {
		const { config, fetchMock } = configWith('main');

		await createFile(config, { path: 'posts/a.md', content: 'catártica', message: 'Add a' });

		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		const body = JSON.parse(init.body as string);
		expect(url).toBe('https://api.github.com/repos/o/r/contents/posts/a.md');
		expect(init.method).toBe('PUT');
		expect(body).toMatchObject({ message: 'Add a', branch: 'main' });
		expect(Buffer.from(body.content, 'base64').toString('utf8')).toBe('catártica');
		expect(body).not.toHaveProperty('sha');
	});

	it('leaves the branch out to use the default one', async () => {
		const { config, fetchMock } = configWith();
		await createFile(config, { path: 'a.md', content: 'x', message: 'm' });
		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(JSON.parse(init.body as string)).not.toHaveProperty('branch');
	});

	it('encodes each path segment', async () => {
		const { config, fetchMock } = configWith();
		await createFile(config, { path: 'posts/a b.md', content: 'x', message: 'm' });
		expect(fetchMock.mock.calls[0]).toEqual([expect.stringContaining('/contents/posts/a%20b.md'), expect.anything()]);
	});

	it('returns the commit sha and url', async () => {
		const { config } = configWith();
		expect(await createFile(config, { path: 'a.md', content: 'x', message: 'm' })).toEqual({
			commitSha: 'abc123',
			commitUrl: 'https://github.com/o/r/commit/abc123',
		});
	});
});
