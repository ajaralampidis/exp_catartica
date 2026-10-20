import type { ArtGeneratorName } from '../art-generators/registry.ts';

// What a Post holds: the Writing and the ArtGenerator that draws it.
export type Post = { artGenerator: ArtGeneratorName; writing: string };

// A Post read back from its file. The id is the file name without `.md`.
export type StoredPost = Post & { id: string };
