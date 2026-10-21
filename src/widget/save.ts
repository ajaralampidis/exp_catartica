import type { ArtGeneratorName } from '../art-generators/registry.ts';

// Sends the Writing to the server, which saves it as a Post. Returns a message for the user.
export async function save(artGenerator: ArtGeneratorName, writing: string, secretPhrase: string): Promise<string> {
	try {
		const response = await fetch('/api/posts', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ artGenerator, writing, secretPhrase }),
		});
		if (response.ok) return 'Saved. It shows in Posts after the next deploy.';
		const { error } = await response.json().catch(() => ({}));
		return error ?? `Failed (${response.status}).`;
	} catch {
		return 'No connection.';
	}
}
