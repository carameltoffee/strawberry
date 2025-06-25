import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    assetsInclude: ['*.jpg'],
    plugins: [react()],
    allowedHosts: ['.railway.app', 'localhost'],
    preview: {
      allowedHosts: ['.railway.app', 'localhost'],
      cors: true,
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 3000,

    },
    define: {
      __BASE_API_URL__: JSON.stringify(env.VITE_BASE_API_URL),
      __JWT_SECRET__: JSON.stringify(env.JWT_SECRET)
    },
  };
});