import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => ({
    build: {
        outDir: path.resolve(__dirname, './dist')
    },
    // define: {
    //     'import.meta.env._version': JSON.stringify(
    //         `${dayjs().format('YYYY-MM-DD HH:mm:ss')}|${execSync(
    //             'git rev-parse HEAD'
    //         )
    //             .toString()
    //             .slice(0, 7)}`
    //     )
    // },
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
            '/api': loadEnv(mode, process.cwd(), '').VITE_API_URL,
            '/admin': loadEnv(mode, process.cwd(), '').VITE_API_URL
        }
    }
}))
