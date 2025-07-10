import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => ({
    build: {
        outDir: path.resolve(__dirname, './dist')
    },
    esbuild: {
        drop: mode === 'development' ? [] : ['console', 'debugger'],
        legalComments: 'none'
    },
    plugins: [react(), optimizeLodashImports(), viteCompression()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        proxy: {
            '/reportApi': {
                target: 'http://172.31.152.17',
                changeOrigin: true,
                secure: false,
                logLevel: 'debug',
                cookieDomainRewrite: {
                    '*': 'localhost'
                },
                rewrite: (path) =>
                    path.replace(/^\/api/, '/reportApi/userprofile/api')
            },
            '/admin': loadEnv(mode, process.cwd(), '').VITE_API_URL
        }
    }
}))
