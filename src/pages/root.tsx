import App from './app'
import appRoutes from '@/routes/appRoutes'
import { FC, Suspense } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'

const Root: FC = () => (
    // 这里使用 Suspense 解决懒加载导致的同步更新错误
    <Suspense fallback={<div>加载中...</div>}>
        {useRoutes([
            {
                element: <App />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/analysis" replace />
                    },
                    ...appRoutes
                ]
            }
        ])}
    </Suspense>
)

export default Root
