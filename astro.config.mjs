import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
	output: 'static',
	adapter: vercel(),
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Courier Prime',
			cssVariable: '--font-courier-prime',
			weights: [700],
			styles: ['normal'],
			fallbacks: ['monospace'],
		},
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
