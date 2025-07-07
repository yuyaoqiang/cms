import AppLayout from '@/layouts/AppLayout'
import appRoutes from '@/routes/appRoutes'
import { FC } from 'react'

const App: FC = () => <AppLayout menus={appRoutes} />

export default App
