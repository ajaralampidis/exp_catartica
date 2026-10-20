import { parsePostFile } from './parse-post-file.ts';
import type { StoredPost } from './post.ts';

const files = import.meta.glob<string>('/posts/*.md', { query: '?raw', import: 'default', eager: true });

// Every Post in the `posts/` folder, newest first.
export function loadPosts(): StoredPost[] {
	return Object.entries(files)
		.map(([path, source]) => ({ id: path.split('/').pop()!.replace(/\.md$/, ''), ...parsePostFile(source) }))
		.sort((a, b) => b.id.localeCompare(a.id));
}
