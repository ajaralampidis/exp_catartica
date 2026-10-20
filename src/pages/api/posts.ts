import type { APIRoute } from 'astro';
import { publishPost } from '../../posts/publish.ts';

// Runs on the server for each request, so the GitHub token never reaches the browser.
export const prerender = false;

export const POST: APIRoute = ({ request }) => publishPost(request, process.env);
