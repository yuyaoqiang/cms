import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { FC } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

interface MenuItem {
    name?: string
    path: string
    hideInMenu?: boolean
}

interface Props {
    menus: MenuItem[]
}

const { Header, Content, Sider } = Layout

const AppLayout: FC<Props> = ({ menus }) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const items: MenuProps['items'] = (menus ?? [])
        .filter((m) => !m.hideInMenu)
        .map((m) => ({
            key: m.path,
            label: m.name
        }))

    return (
        <Layout className="min-h-screen">
            <Sider
                width={220}
                className="relative bg-white shadow-md overflow-y-auto overflow-x-visible"
            >
                <Menu
                    mode="inline"
                    items={items}
                    selectedKeys={[pathname]}
                    onClick={({ key }) => navigate(key)}
                />
                <div
                    id="sider-center-extra"
                    className="absolute top-1/2 left-full -translate-y-1/2 ml-2"
                />
            </Sider>
            <Layout>
                <Header className="bg-white shadow" />
                <Content className="p-4 overflow-y-auto h-[calc(100vh-64px)] relative">
                    <div
                        id="content-left-extra"
                        className="absolute top-1/2 left-0 -translate-y-1/2"
                    />
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default AppLayout
