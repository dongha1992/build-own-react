import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: [],
  },
  plugins: [
    react({
      // JSX를 react/jsx-runtime이 아니라 React.createElement로 직접 컴파일하게 함
      jsxRuntime: 'classic',
    }),
  ],
});
