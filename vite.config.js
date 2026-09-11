import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rawImagesModule = 'virtual:raw-images';
const resolvedRawImagesModule = `\0${rawImagesModule}`;

function rawImagesPlugin() {
  return {
    name: 'raw-images-manifest',
    resolveId(id) {
      return id === rawImagesModule ? resolvedRawImagesModule : undefined;
    },
    load(id) {
      if (id !== resolvedRawImagesModule) return undefined;

      const rawImagesDirectory = resolve('./public/images/raw');
      let filenames = [];
      try {
        filenames = readdirSync(rawImagesDirectory)
          .filter(filename => /\.(jpe?g|png|webp)$/i.test(filename))
          .sort();
      } catch {
        // The directory may not exist until raw images are added locally.
      }

      return `export default ${JSON.stringify(filenames)};`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [rawImagesPlugin(), react()],
});
