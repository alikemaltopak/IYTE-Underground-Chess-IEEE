// README ekran görüntüleri için Firebase'i örnek veriyle taklit eden ayrı Vite yapılandırması.
// Kullanım: npm run screenshots
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const mock = (f: string) => path.resolve(__dirname, 'mocks', f);

export default defineConfig({
  root: path.resolve(__dirname, '..'), // Tailwind sınıfları src/ altından taransın
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'firebase/app': mock('firebase-app.ts'),
      'firebase/auth': mock('firebase-auth.ts'),
      'firebase/firestore': mock('firebase-firestore.ts'),
    },
  },
  server: { port: 4173, strictPort: true },
});
