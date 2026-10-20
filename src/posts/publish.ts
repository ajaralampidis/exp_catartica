import { isArtGeneratorName } from '../art-generators/registry.ts';
import { readGitHubConfig } from '../github/config.ts';
import { isValidWriting } from '../lib/widget-core.ts';
import { savePost } from './save-post.ts';

type Env = Record<string, string | undefined>;

// Ignores case and outer spaces: phones capitalize the first letter.
const normalize = (phrase: unknown) => (typeof phrase === 'string' ? phrase.trim().toLowerCase() : '');

function reply(status: number, body: object): Response {
	return Response.json(body, { status });
}

// The server side of the Publish button. The request holds the Writing, the
// ArtGenerator and the secret phrase. It saves a Post only if the phrase is right.
export async function publishPost(request: Request, env: Env): Promise<Response> {
	const { artGenerator, writing, secretPhrase } = await request.json().catch(() => ({}));
	const expected = normalize(env.SECRET_PHRASE);
	if (!expected || normalize(secretPhrase) !== expected) return reply(401, { error: 'Wrong secret phrase.' });
	if (!isArtGeneratorName(artGenerator) || typeof writing !== 'string' || !isValidWriting(writing)) {
		return reply(400, { error: 'Write something first.' });
	}
	try {
		const { id } = await savePost({ artGenerator, writing }, readGitHubConfig(env));
		return reply(201, { id });
	} catch (error) {
		console.error(error);
		return reply(502, { error: 'Could not save the Post.' });
	}
}
