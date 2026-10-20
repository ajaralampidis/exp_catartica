// Commits one Post to GitHub. Run: pnpm save-post "your writing"
import { readGitHubConfig } from '../src/github/config.ts';
import { savePost } from '../src/posts/save-post.ts';

const writing = process.argv[2];
if (!writing?.trim()) {
	console.error('Usage: pnpm save-post "your writing"');
	process.exit(1);
}

try {
	const saved = await savePost({ artGenerator: 'nested-squares', writing }, readGitHubConfig(process.env));
	console.log(`Saved ${saved.id}\n${saved.commitUrl}`);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
