import './index.css'
import './styles/component-overrides.css'
import { IS_PROD } from '@/constants'
import Root from '@/pages/root'
import { useStore } from '@/stores'
import { disableReactDevTools, injectBuildVersion } from '@/utils'
import { ConfigProvider } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

injectBuildVersion()

// 从 URL 中解析 token
const params = new URLSearchParams(window.location.search)
const urlToken = params.get('token')
if (urlToken) {
    useStore.getState().setToken(urlToken)
}

if (IS_PROD) {
    disableReactDevTools()
    // antiDebugging()
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <ConfigProvider>
                <Root />
            </ConfigProvider>
        </BrowserRouter>
    </StrictMode>
)
