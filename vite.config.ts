import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Injeta apenas a API KEY de forma segura
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  };
});