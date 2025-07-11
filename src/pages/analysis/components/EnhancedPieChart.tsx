import { FC, useState, useEffect, useMemo } from 'react'
import { Progress, Tooltip } from 'antd'

interface EnhancedPieChartProps {
    data: Record<string, number>
    title?: string
    size?: number
    showLegend?: boolean
    showValues?: boolean
    animated?: boolean
    colorScheme?: 'default' | 'gradient' | 'rainbow'
}

const EnhancedPieChart: FC<EnhancedPieChartProps> = ({
    data,
    title,
    size = 300,
    showLegend = true,
    showValues: _showValues = true,
    animated = true,
    colorScheme = 'gradient'
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
    const [animationPhase, setAnimationPhase] = useState(0)

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setIsVisible(true)
                // 分阶段动画
                const phases = [0.3, 0.6, 1.0]
                phases.forEach((phase, index) => {
                    setTimeout(() => setAnimationPhase(phase), (index + 1) * 400)
                })
            }, 200)
            return () => clearTimeout(timer)
        } else {
            setIsVisible(true)
            setAnimationPhase(1)
        }
    }, [animated])

    const total = Object.values(data).reduce((a, b) => a + b, 0)
    const entries = Object.entries(data)

    // 增强的颜色方案
    const colorSchemes = {
        default: [
            '#1890ff', '#52c41a', '#faad14', '#f5222d', 
            '#722ed1', '#13c2c2', '#eb2f96', '#fa541c'
        ],
        gradient: [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
        ],
        rainbow: [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
            '#f0932b', '#eb4d4b', '#6c5ce7', '#74b9ff'
        ]
    }

    const colors = colorSchemes[colorScheme]
    const isGradient = colorScheme === 'gradient'

    // 计算饼图段
    const segments = useMemo(() => {
        let currentAngle = 0
        return entries.map(([key, value], index) => {
            const percentage = (value / total) * 100
            const angle = (value / total) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            
            // SVG 路径计算
            const startAngleRad = (startAngle * Math.PI) / 180
            const endAngleRad = (endAngle * Math.PI) / 180
            
            const largeArcFlag = angle <= 180 ? '0' : '1'
            const outerRadius = size / 2 - 20
            const innerRadius = size / 6 // 甜甜圈效果
            const centerX = size / 2
            const centerY = size / 2
            
            // 外圆弧点
            const x1 = centerX + outerRadius * Math.cos(startAngleRad)
            const y1 = centerY + outerRadius * Math.sin(startAngleRad)
            const x2 = centerX + outerRadius * Math.cos(endAngleRad)
            const y2 = centerY + outerRadius * Math.sin(endAngleRad)
            
            // 内圆弧点
            const x3 = centerX + innerRadius * Math.cos(endAngleRad)
            const y3 = centerY + innerRadius * Math.sin(endAngleRad)
            const x4 = centerX + innerRadius * Math.cos(startAngleRad)
            const y4 = centerY + innerRadius * Math.sin(startAngleRad)
            
            const pathData = [
                `M ${x1} ${y1}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                'Z'
            ].join(' ')
            
            currentAngle = endAngle
            
            return {
                key,
                value,
                percentage,
                color: colors[index % colors.length],
                path: pathData,
                angle: startAngle + angle / 2,
                isGradient
            }
        })
    }, [entries, total, size, colors, isGradient])

    return (
        <div className="flex flex-col items-center space-y-6">
            {title && (
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                    {title}
                </h3>
            )}
            
            <div className="flex items-center justify-center space-x-8">
                {/* 饼图 */}
                <div className="relative">
                    <svg 
                        width={size} 
                        height={size}
                        className={`transform transition-all duration-700 ${
                            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        }`}
                        style={{
                            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))'
                        }}
                    >
                        {/* 渐变定义 */}
                        <defs>
                            {segments.map((segment, index) => (
                                segment.isGradient && (
                                    <linearGradient
                                        key={`gradient-${index}`}
                                        id={`gradient-${index}`}
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor={segment.color.match(/#[0-9a-f]{6}/gi)?.[0] || '#1890ff'} />
                                        <stop offset="100%" stopColor={segment.color.match(/#[0-9a-f]{6}/gi)?.[1] || '#722ed1'} />
                                    </linearGradient>
                                )
                            ))}
                        </defs>
                        
                        {segments.map((segment, index) => {
                            const isHovered = hoveredSegment === segment.key
                            const scale = isHovered ? 1.05 : 1
                            const opacity = animationPhase
                            
                            return (
                                <g key={segment.key}>
                                    <path
                                        d={segment.path}
                                        fill={segment.isGradient ? `url(#gradient-${index})` : segment.color}
                                        stroke="white"
                                        strokeWidth="3"
                                        className="cursor-pointer transition-all duration-300"
                                        style={{
                                            transform: `scale(${scale})`,
                                            transformOrigin: `${size/2}px ${size/2}px`,
                                            opacity: opacity * (isHovered ? 1 : 0.9),
                                            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
                                        }}
                                        onMouseEnter={() => setHoveredSegment(segment.key)}
                                        onMouseLeave={() => setHoveredSegment(null)}
                                    />
                                    
                                    {/* 悬停时的标签 */}
                                    {isHovered && (
                                        <g>
                                            <text
                                                x={size/2 + (size/3) * Math.cos((segment.angle * Math.PI) / 180)}
                                                y={size/2 + (size/3) * Math.sin((segment.angle * Math.PI) / 180)}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="text-sm font-bold"
                                                fill="white"
                                                style={{
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                                    animation: 'pulse 1s ease-in-out infinite'
                                                }}
                                            >
                                                {segment.key}
                                            </text>
                                            <text
                                                x={size/2 + (size/3) * Math.cos((segment.angle * Math.PI) / 180)}
                                                y={size/2 + (size/3) * Math.sin((segment.angle * Math.PI) / 180) + 16}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="text-xs"
                                                fill="white"
                                                style={{
                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                                }}
                                            >
                                                {segment.value.toLocaleString()}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )
                        })}
                    </svg>
                    
                    {/* 中心显示 */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                            width: size / 3,
                            height: size / 3,
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(255,255,255,0.95)',
                            borderRadius: '50%',
                            border: '3px solid rgba(0,0,0,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800 mb-1">
                                {total.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                                总计
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 图例 */}
                {showLegend && (
                    <div className="flex flex-col space-y-3 max-w-xs">
                        {segments.map((segment, index) => {
                            const isHovered = hoveredSegment === segment.key
                            
                            return (
                                <Tooltip 
                                    key={segment.key}
                                    title={`${segment.key}: ${segment.value.toLocaleString()} (${segment.percentage.toFixed(1)}%)`}
                                    placement="right"
                                >
                                    <div
                                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                                            isHovered 
                                                ? 'bg-blue-50 transform scale-105 shadow-md' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onMouseEnter={() => setHoveredSegment(segment.key)}
                                        onMouseLeave={() => setHoveredSegment(null)}
                                        style={{
                                            animation: `slideInRight 0.6s ease-out ${index * 0.1}s both`
                                        }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                                            style={{
                                                background: segment.isGradient 
                                                    ? segment.color 
                                                    : segment.color,
                                                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                                                transition: 'transform 0.2s ease'
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-800 truncate">
                                                {segment.key}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {segment.value.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-800">
                                                {segment.percentage.toFixed(1)}%
                                            </div>
                                            <div className="w-16 mt-1">
                                                <Progress 
                                                    percent={segment.percentage} 
                                                    size="small" 
                                                    showInfo={false}
                                                    strokeColor={segment.isGradient ? '#1890ff' : segment.color}
                                                    className="leading-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Tooltip>
                            )
                        })}
                    </div>
                )}
            </div>
            
            {/* 添加动画样式 */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    )
}

export default EnhancedPieChart