import { createFile } from '../github/contents.ts';
import type { GitHubConfig } from '../github/config.ts';
import { buildPostFile } from './build-post-file.ts';
import type { Post } from './post.ts';

// The GitHub-as-database service: commits one Post to the repo.
export async function savePost(post: Post, config: GitHubConfig) {
	const { id, path, content } = buildPostFile(post);
	const { commitSha, commitUrl } = await createFile(config, { path, content, message: `Add post ${id}` });
	return { id, commitSha, commitUrl };
}
