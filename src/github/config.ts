export type GitHubConfig = {
	token: string;
	owner: string;
	repo: string;
	branch?: string; // the repo's default branch when missing
	fetch?: typeof fetch; // for tests
};

type Env = Record<string, string | undefined>;

function required(env: Env, name: string): string {
	const value = env[name];
	if (!value) throw new Error(`Missing env var ${name}`);
	return value;
}

export function readGitHubConfig(env: Env): GitHubConfig {
	return {
		token: required(env, 'GITHUB_TOKEN'),
		owner: required(env, 'GITHUB_OWNER'),
		repo: required(env, 'GITHUB_REPO'),
		branch: env.GITHUB_BRANCH || undefined,
	};
}
