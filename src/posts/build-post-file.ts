import type { Post } from './post.ts';

export type PostFile = { id: string; path: string; content: string };

// Sorts by time. The suffix keeps two Posts of the same millisecond apart.
function newId(): string {
	return `${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID().slice(0, 8)}`;
}

// One Post is one Markdown file: the ArtGenerator in the front matter, the
// Writing as the body, kept as typed. `parsePostFile` reads it back.
export function buildPostFile(post: Post, id = newId()): PostFile {
	return {
		id,
		path: `posts/${id}.md`,
		content: `---\nartGenerator: ${post.artGenerator}\n---\n${post.writing}\n`,
	};
}
