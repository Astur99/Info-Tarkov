import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { Buffer } from 'node:buffer'
import { handler as imageProxyHandler } from './netlify/functions/image-proxy.js'
import { handler as pmcProfileHandler } from './netlify/functions/pmc-profile.js'

const localApiPlugin = () => ({
  name: 'info-tarkov-local-api',
  configureServer(server) {
    server.middlewares.use('/api/pmc-profile', async (req, res) => {
      try {
        const requestUrl = new URL(req.url || '', 'http://localhost');
        const response = await pmcProfileHandler({
          queryStringParameters: {
            username: requestUrl.searchParams.get('username'),
            mode: requestUrl.searchParams.get('mode')
          }
        });

        res.statusCode = response.statusCode;
        Object.entries(response.headers || {}).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.end(response.body);
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error?.message || 'Local API error' }));
      }
    });

    server.middlewares.use('/api/image-proxy', async (req, res) => {
      try {
        const requestUrl = new URL(req.url || '', 'http://localhost');
        const response = await imageProxyHandler({
          queryStringParameters: {
            url: requestUrl.searchParams.get('url')
          }
        });

        res.statusCode = response.statusCode;
        Object.entries(response.headers || {}).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.end(response.isBase64Encoded ? Buffer.from(response.body, 'base64') : response.body);
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error?.message || 'Local image proxy error' }));
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    localApiPlugin(),
    react(),
    sitemap({
      hostname: 'https://infotarkov.com'
    })
  ],
})
