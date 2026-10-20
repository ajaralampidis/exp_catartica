import { describe, expect, it, vi } from 'vitest';
import type { GitHubConfig } from './config.ts';
import { GitHubApiError } from './github-api-error.ts';
import { githubRequest } from './request.ts';

function configWith(response: Response) {
	const fetchMock = vi.fn(async () => response);
	const config: GitHubConfig = { token: 'secret', owner: 'o', repo: 'r', fetch: fetchMock as unknown as typeof fetch };
	return { config, fetchMock };
}

describe('githubRequest', () => {
	it('sends the token, the API version and the JSON body', async () => {
		const { config, fetchMock } = configWith(Response.json({ ok: true }));

		await githubRequest(config, 'PUT', '/repos/o/r/contents/a.md', { message: 'hi' });

		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('https://api.github.com/repos/o/r/contents/a.md');
		expect(init.method).toBe('PUT');
		expect(init.headers).toMatchObject({
			Authorization: 'Bearer secret',
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2026-03-10',
		});
		expect(init.body).toBe('{"message":"hi"}');
	});

	it('returns the parsed JSON', async () => {
		const { config } = configWith(Response.json({ commit: { sha: 'abc' } }, { status: 201 }));
		expect(await githubRequest(config, 'PUT', '/x')).toEqual({ commit: { sha: 'abc' } });
	});

	it('throws a GitHubApiError with the status and the GitHub message', async () => {
		const { config } = configWith(Response.json({ message: 'Not Found' }, { status: 404 }));

		const error = await githubRequest(config, 'GET', '/x').catch((e) => e);

		expect(error).toBeInstanceOf(GitHubApiError);
		expect(error).toMatchObject({ status: 404, rateLimited: false, message: 'GitHub API 404: Not Found' });
	});

	it('flags a rate limit when no requests remain', async () => {
		const { config } = configWith(Response.json({ message: 'rate limit' }, { status: 403, headers: { 'x-ratelimit-remaining': '0' } }));
		expect(await githubRequest(config, 'GET', '/x').catch((e) => e)).toMatchObject({ rateLimited: true });
	});

	it('flags a rate limit when GitHub says when to retry', async () => {
		const { config } = configWith(Response.json({ message: 'slow down' }, { status: 429, headers: { 'retry-after': '60' } }));
		expect(await githubRequest(config, 'GET', '/x').catch((e) => e)).toMatchObject({ rateLimited: true });
	});

	it('survives an error body that is not JSON', async () => {
		const { config } = configWith(new Response('<html>', { status: 502, statusText: 'Bad Gateway' }));
		expect(await githubRequest(config, 'GET', '/x').catch((e) => e)).toMatchObject({ status: 502, message: 'GitHub API 502: Bad Gateway' });
	});
});
