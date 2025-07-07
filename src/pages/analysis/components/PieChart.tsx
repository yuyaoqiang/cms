import { FC } from 'react'

interface PieChartProps {
    data: Record<string, number>
}

const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']

// 使用 CSS conic-gradient 绘制简单饼图
const PieChart: FC<PieChartProps> = ({ data }) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0)
    let start = 0
    const parts = Object.values(data).map((v, i) => {
        const end = start + (v / total) * 100
        const part = `${colors[i % colors.length]} ${start}% ${end}%`
        start = end
        return part
    })
    const gradient = `conic-gradient(${parts.join(',')})`
    return (
        <div className="flex flex-col items-center mr-4">
            <div
                style={{
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: gradient
                }}
            />
            <ul className="mt-2">
                {Object.keys(data).map((key, i) => (
                    <li key={key} className="flex items-center text-sm">
                        <span
                            className="inline-block w-3 h-3 mr-1"
                            style={{
                                backgroundColor: colors[i % colors.length]
                            }}
                        />
                        {key}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default PieChart
