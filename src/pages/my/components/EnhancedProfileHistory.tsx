import { 
    CheckCircleOutlined, 
    ClockCircleOutlined, 
    UserOutlined,
    TagOutlined,
    BranchesOutlined,
    ExclamationCircleOutlined,
    DownloadOutlined,
    ShareAltOutlined 
} from '@ant-design/icons'
import { Timeline, Card, Button, Space, Tag, Statistic, Row, Col, Empty } from 'antd'
import { FC, useMemo } from 'react'
import { useParams } from 'react-router-dom'

interface Props {
    id?: string
}

// 模拟历史版本数据
const generateMockHistory = (profileId: string) => {
    const baseDate = new Date()
    return [
        {
            id: `${profileId}-v3`,
            version: 'v3.0',
            timestamp: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            changes: [
                { type: 'add', content: '新增用户风控标签分类' },
                { type: 'modify', content: '优化用户活跃度计算逻辑' },
                { type: 'remove', content: '移除已过期的优惠活动标签' }
            ],
            tagCount: 12,
            userCount: 4520,
            operator: '数据分析师',
            description: '根据业务需求新增风控相关标签，优化用户画像精准度'
        },
        {
            id: `${profileId}-v2`,
            version: 'v2.1',
            timestamp: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'archived',
            changes: [
                { type: 'add', content: '新增用户行为偏好标签' },
                { type: 'modify', content: '调整VIP等级分类规则' }
            ],
            tagCount: 10,
            userCount: 4200,
            operator: '产品经理',
            description: '基于用户反馈优化标签体系，提升用户体验'
        },
        {
            id: `${profileId}-v1`,
            version: 'v1.0',
            timestamp: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'archived',
            changes: [
                { type: 'add', content: '创建基础用户画像' },
                { type: 'add', content: '设置核心用户标签' }
            ],
            tagCount: 8,
            userCount: 3800,
            operator: '数据分析师',
            description: '初始版本，建立用户画像基础框架'
        }
    ]
}

const EnhancedProfileHistory: FC<Props> = ({ id }) => {
    const params = useParams()
    const profileId = id ?? params.id ?? ''
    
    const historyData = useMemo(() => generateMockHistory(profileId), [profileId])
    
    const currentVersion = historyData[0]
    const previousVersions = historyData.slice(1)
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#52c41a'
            case 'archived':
                return '#8c8c8c'
            default:
                return '#d9d9d9'
        }
    }
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircleOutlined style={{ color: '#52c41a' }} />
            case 'archived':
                return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            default:
                return <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />
        }
    }
    
    const getChangeTypeColor = (type: string) => {
        switch (type) {
            case 'add':
                return '#52c41a'
            case 'modify':
                return '#1890ff'
            case 'remove':
                return '#ff4d4f'
            default:
                return '#d9d9d9'
        }
    }
    
    const getChangeTypeLabel = (type: string) => {
        switch (type) {
            case 'add':
                return '新增'
            case 'modify':
                return '修改'
            case 'remove':
                return '删除'
            default:
                return '其他'
        }
    }

    if (!profileId) {
        return (
            <div className="text-center py-8">
                <Empty description="画像ID不存在" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 当前版本概览 */}
            <Card 
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                bodyStyle={{ padding: '24px' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircleOutlined className="text-green-600 text-lg" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                当前版本 {currentVersion.version}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {new Date(currentVersion.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <Space>
                        <Button icon={<DownloadOutlined />} type="primary" ghost>
                            导出版本
                        </Button>
                        <Button icon={<ShareAltOutlined />}>
                            分享版本
                        </Button>
                    </Space>
                </div>
                
                <Row gutter={[16, 16]} className="mb-4">
                    <Col span={8}>
                        <Statistic 
                            title="标签数量" 
                            value={currentVersion.tagCount} 
                            suffix="个"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic 
                            title="用户数量" 
                            value={currentVersion.userCount} 
                            suffix="人"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic 
                            title="操作者" 
                            value={currentVersion.operator}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Col>
                </Row>
                
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">本次更新内容：</div>
                    <div className="space-y-1">
                        {currentVersion.changes.map((change, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Tag color={getChangeTypeColor(change.type)}>
                                    {getChangeTypeLabel(change.type)}
                                </Tag>
                                <span className="text-sm text-gray-600">{change.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                        <strong>版本说明：</strong> {currentVersion.description}
                    </div>
                </div>
            </Card>
            
            {/* 历史版本时间轴 */}
            <Card title="历史版本" bodyStyle={{ padding: '24px' }}>
                {previousVersions.length > 0 ? (
                    <Timeline>
                        {previousVersions.map((version) => (
                            <Timeline.Item
                                key={version.id}
                                dot={getStatusIcon(version.status)}
                                color={getStatusColor(version.status)}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <h4 className="text-base font-medium text-gray-800">
                                                版本 {version.version}
                                            </h4>
                                            <Tag color={getStatusColor(version.status)}>
                                                {version.status === 'active' ? '当前' : '已归档'}
                                            </Tag>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(version.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <TagOutlined />
                                            <span>{version.tagCount} 个标签</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <UserOutlined />
                                            <span>{version.userCount} 用户</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <BranchesOutlined />
                                            <span>{version.operator}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-700">更新内容：</div>
                                        <div className="grid grid-cols-1 gap-1">
                                            {version.changes.map((change, changeIndex) => (
                                                <div key={changeIndex} className="flex items-center space-x-2">
                                                    <Tag color={getChangeTypeColor(change.type)}>
                                                        {getChangeTypeLabel(change.type)}
                                                    </Tag>
                                                    <span className="text-sm text-gray-600">{change.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-700">
                                            <strong>版本说明：</strong> {version.description}
                                        </div>
                                    </div>
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                ) : (
                    <Empty 
                        description="暂无历史版本记录" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>
            
            {/* 版本对比按钮 */}
            {previousVersions.length > 0 && (
                <Card className="text-center">
                    <Space size="middle">
                        <Button type="primary" icon={<BranchesOutlined />}>
                            版本对比
                        </Button>
                        <Button icon={<ClockCircleOutlined />}>
                            回滚到指定版本
                        </Button>
                        <Button icon={<DownloadOutlined />}>
                            批量导出
                        </Button>
                    </Space>
                </Card>
            )}
        </div>
    )
}

export default EnhancedProfileHistory