import { describe, expect, it } from 'vitest';
import { readGitHubConfig } from './config.ts';

describe('readGitHubConfig', () => {
	it('reads the token, the repo and the branch', () => {
		const env = { GITHUB_TOKEN: 't', GITHUB_OWNER: 'o', GITHUB_REPO: 'r', GITHUB_BRANCH: 'posts' };
		expect(readGitHubConfig(env)).toEqual({ token: 't', owner: 'o', repo: 'r', branch: 'posts' });
	});

	it('treats an empty branch as missing', () => {
		const env = { GITHUB_TOKEN: 't', GITHUB_OWNER: 'o', GITHUB_REPO: 'r', GITHUB_BRANCH: '' };
		expect(readGitHubConfig(env).branch).toBeUndefined();
	});

	it('names the env var that is missing', () => {
		expect(() => readGitHubConfig({ GITHUB_OWNER: 'o', GITHUB_REPO: 'r' })).toThrow('GITHUB_TOKEN');
	});
});
