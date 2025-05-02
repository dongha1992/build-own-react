import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    optimizeDeps: {
        include: [],
    },
    plugins: [
        react({
            // JSX를 React.createElement로 직접 컴파일하게 함
            jsxRuntime: 'classic',
        }),
    ],
});