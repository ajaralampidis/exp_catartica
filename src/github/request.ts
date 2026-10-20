import type { GitHubConfig } from './config.ts';
import { GitHubApiError } from './github-api-error.ts';

const API_URL = 'https://api.github.com';
const API_VERSION = '2026-03-10';

// GitHub answers 403 or 429 for both rate limits; the headers tell them apart.
function isRateLimited(response: Response): boolean {
	const limitStatus = response.status === 403 || response.status === 429;
	return limitStatus && (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after'));
}

// One call to the GitHub REST API: auth, version and error handling live here.
export async function githubRequest<T>(config: GitHubConfig, method: string, path: string, body?: unknown): Promise<T> {
	const response = await (config.fetch ?? fetch)(`${API_URL}${path}`, {
		method,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${config.token}`,
			'Content-Type': 'application/json',
			'User-Agent': 'exp-catartica',
			'X-GitHub-Api-Version': API_VERSION,
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new GitHubApiError(response.status, data.message ?? response.statusText, isRateLimited(response));
	}
	return data as T;
}
