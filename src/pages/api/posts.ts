import type { APIRoute } from 'astro';
import { handleSave } from '../../posts/handle-save.ts';

// Runs on the server for each request, so the GitHub token never reaches the browser.
export const prerender = false;

export const POST: APIRoute = ({ request }) => handleSave(request, process.env);
