import { afterEach, describe, expect, it, vi } from 'vitest';
import { parsePostFile } from './parse-post-file.ts';
import { publishPost } from './publish.ts';

const env = { SECRET_PHRASE: 'represion intoxicante', GITHUB_TOKEN: 't', GITHUB_OWNER: 'o', GITHUB_REPO: 'r' };
const body = { artGenerator: 'nested-squares', writing: 'hola', secretPhrase: 'represion intoxicante' };

const publish = (overrides: object = {}, environment: Record<string, string | undefined> = env) =>
	publishPost(new Request('http://localhost/api/posts', { method: 'POST', body: JSON.stringify({ ...body, ...overrides }) }), environment);

function stubGitHub(status = 201) {
	const fetchMock = vi.fn(async () => Response.json({ commit: { sha: 'abc', html_url: 'https://github.com/o/r/commit/abc' }, message: 'nope' }, { status }));
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('publishPost', () => {
	it('commits the Post and returns its id', async () => {
		const fetchMock = stubGitHub();

		const response = await publish();

		const { id } = await response.json();
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(response.status).toBe(201);
		expect(url).toBe(`https://api.github.com/repos/o/r/contents/posts/${id}.md`);
		expect(parsePostFile(Buffer.from(JSON.parse(init.body as string).content, 'base64').toString('utf8'))).toEqual({
			artGenerator: 'nested-squares',
			writing: 'hola',
		});
	});

	it('accepts the phrase in other case and with outer spaces', async () => {
		stubGitHub();
		expect((await publish({ secretPhrase: '  Represion Intoxicante ' })).status).toBe(201);
	});

	it('rejects a wrong phrase without calling GitHub', async () => {
		const fetchMock = stubGitHub();
		const response = await publish({ secretPhrase: 'nope' });
		expect(response.status).toBe(401);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects every request when the server has no phrase', async () => {
		const fetchMock = stubGitHub();
		expect((await publish({ secretPhrase: '' }, { ...env, SECRET_PHRASE: undefined })).status).toBe(401);
		expect((await publish({ secretPhrase: undefined }, { ...env, SECRET_PHRASE: '' })).status).toBe(401);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects an empty Writing', async () => {
		const fetchMock = stubGitHub();
		expect((await publish({ writing: '  \n' })).status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects an unknown ArtGenerator', async () => {
		expect((await publish({ artGenerator: 'toString' })).status).toBe(400);
	});

	it('rejects a body that is not JSON', async () => {
		const response = await publishPost(new Request('http://localhost/api/posts', { method: 'POST', body: 'hi' }), env);
		expect(response.status).toBe(401);
	});

	it('answers 502 without the GitHub message when GitHub fails', async () => {
		stubGitHub(401);
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await publish();

		expect(response.status).toBe(502);
		expect(JSON.stringify(await response.json())).not.toContain('nope');
	});
});
