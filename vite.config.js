import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pages } from './src/data/pages.js'

const escapeAttr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Writes one index.html per route into the build, with that page's title and Open Graph tags.
// Link previews (LinkedIn, Slack) do not run JavaScript, so the router alone cannot set them.
// Hosts serve a real file before the SPA rewrite, so /projects/at-capacity gets its own tags.
function pageMeta() {
  let outDir = 'dist'
  return {
    name: 'page-meta',
    apply: 'build',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir)
    },
    closeBundle() {
      const template = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const [path, { title, description }] of Object.entries(pages)) {
        const html = template
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`)
          .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeAttr(description)}" />`)
          .replace(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${escapeAttr(title)}" />`)
          .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${escapeAttr(description)}" />`)
        const file = join(outDir, path, 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html)
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), pageMeta()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
