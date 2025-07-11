import EnhancedProfileCard from './components/EnhancedProfileCard'
import { getLocalStorage } from '@/utils/xLocalStorage'
import { 
    UsergroupAddOutlined, 
    PlusOutlined
} from '@ant-design/icons'
import { Button, Empty, Row, Col, Statistic, Card } from 'antd'
import { FC, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'


interface Profile {
    id: string
    name: string
    tags: { name: string; values: string[] }[]
    updateTime: string
    userCount: number
}

const MyUserProfiles: FC = () => {
    const navigate = useNavigate()
    const [sortBy] = useState<'name' | 'updateTime' | 'userCount'>('updateTime')
    
    const profiles = (getLocalStorage('profiles') as unknown as Profile[]) ?? []
    
    // 排序逻辑
    const sortedProfiles = useMemo(() => {
        let sorted = [...profiles]
        
        // 排序
        sorted.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'userCount':
                    return b.userCount - a.userCount
                case 'updateTime':
                default:
                    return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
            }
        })
        
        return sorted
    }, [profiles, sortBy])
    
    // 统计信息
    const stats = useMemo(() => {
        const totalProfiles = profiles.length
        const avgTagsPerProfile = profiles.length > 0 
            ? Math.round(profiles.reduce((sum, p) => sum + p.tags.length, 0) / profiles.length)
            : 0
        
        return {
            totalProfiles,
            avgTagsPerProfile
        }
    }, [profiles])

    const handleCreateNew = () => {
        navigate('/analysis')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* 页面头部 */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <UsergroupAddOutlined className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    我的用户画像
                                </h1>
                                <p className="text-gray-600 mt-1">管理和分析您的用户画像数据</p>
                            </div>
                        </div>
                        <Button 
                            type="primary" 
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleCreateNew}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            创建新画像
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* 统计卡片 */}
                <Row gutter={[24, 24]} className="mb-8">
                    <Col xs={24} sm={12}>
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="relative p-4">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-lg"></div>
                                <Statistic
                                    title={<span className="text-gray-700 font-medium">总画像数</span>}
                                    value={stats.totalProfiles}
                                    suffix="个"
                                    valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="relative p-4">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-lg"></div>
                                <Statistic
                                    title={<span className="text-gray-700 font-medium">平均标签数</span>}
                                    value={stats.avgTagsPerProfile}
                                    suffix="个"
                                    valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 'bold' }}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
                
                
                {/* 画像列表 */}
                {sortedProfiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedProfiles.map((profile, index) => (
                            <div 
                                key={profile.id}
                                className="transform transition-all duration-300 hover:scale-105"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'fadeInUp 0.6s ease-out forwards'
                                }}
                            >
                                <EnhancedProfileCard profile={profile} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        暂无用户画像
                                    </h3>
                                    <p className="text-gray-500">
                                        开始创建您的第一个用户画像，洞察用户行为
                                    </p>
                                </div>
                            }
                        >
                            <Button 
                                type="primary" 
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={handleCreateNew}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                立即创建画像
                            </Button>
                        </Empty>
                    </div>
                )}
            </div>
            
            {/* 添加CSS动画 */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    )
}

export default MyUserProfiles