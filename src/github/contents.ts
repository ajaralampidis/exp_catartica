import type { GitHubConfig } from './config.ts';
import { githubRequest } from './request.ts';

export type NewFile = { path: string; content: string; message: string };

export type CreatedFile = { commitSha: string; commitUrl: string };

type CreateFileResponse = { commit: { sha: string; html_url: string } };

// Commits one new file to the branch. One call is one commit, and GitHub moves
// the branch, so there is no separate push. A path that exists already fails.
// https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
export async function createFile(config: GitHubConfig, file: NewFile): Promise<CreatedFile> {
	const path = file.path.split('/').map(encodeURIComponent).join('/');
	const { commit } = await githubRequest<CreateFileResponse>(config, 'PUT', `/repos/${config.owner}/${config.repo}/contents/${path}`, {
		message: file.message,
		content: Buffer.from(file.content, 'utf8').toString('base64'),
		branch: config.branch,
	});
	return { commitSha: commit.sha, commitUrl: commit.html_url };
}
