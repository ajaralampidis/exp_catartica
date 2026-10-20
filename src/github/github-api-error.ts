export class GitHubApiError extends Error {
	readonly status: number;
	readonly rateLimited: boolean;

	constructor(status: number, message: string, rateLimited: boolean) {
		super(`GitHub API ${status}: ${message}`);
		this.name = 'GitHubApiError';
		this.status = status;
		this.rateLimited = rateLimited;
	}
}
