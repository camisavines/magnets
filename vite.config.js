import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
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

const REQUIRED_ENV_VARS = [
  'TOKEN',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  for (const key of REQUIRED_ENV_VARS) {
    if (!env[key]) {
      console.warn(`Warning: ${key} is not defined.`);
    }
  }

  // Explicitly inject non-VITE_ prefixed vars into the client bundle.
  // loadEnv with '' prefix loads everything; define makes them available
  // as import.meta.env.<KEY> in frontend code.
  const define = Object.fromEntries(
    REQUIRED_ENV_VARS.map((key) => [
      `import.meta.env.${key}`,
      JSON.stringify(env[key] ?? ''),
    ])
  );

  return {
    define,
    plugins: [rawImagesPlugin(), react()],
  };
});
