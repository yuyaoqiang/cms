import { lazy } from 'react'

const UserProfileAnalysis = lazy(() => import('@/pages/analysis'))
const MyUserProfiles = lazy(() => import('@/pages/my'))
const ProfileDetail = lazy(() => import('@/pages/my/ProfileDetail'))
const ProfileHistory = lazy(() => import('@/pages/my/ProfileHistory'))

const appRoutes = [
    {
        name: '用户分析画像工具',
        path: '/analysis',
        element: <UserProfileAnalysis />
    },
    {
        name: '我的分析画像',
        path: '/my',
        element: <MyUserProfiles />
    },
    {
        path: '/my/:id',
        element: <ProfileDetail />,
        hideInMenu: true
    },
    {
        path: '/my/:id/history',
        element: <ProfileHistory />,
        hideInMenu: true
    }
]

export default appRoutes
