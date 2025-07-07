export type TagType = 'multi' | 'single' | 'dateRange' | 'numberRange' | 'text'

export interface UserTagDefinition {
    key: string
    category: string
    name: string
    type: TagType
    /**
     * 标签定义，解释标签的含义
     */
    definition?: string
    options?: string[]
}

export const userTags: UserTagDefinition[] = [
    {
        key: 'source',
        category: '用户基础标签',
        name: '用户来源',
        definition: '「直客」定义=无上级，「代理」定义=有上级',
        type: 'multi',
        options: ['直客', '代理']
    },
    {
        key: 'registerTime',
        category: '用户基础标签',
        name: '注册时间',
        definition: '会员注册时间',
        type: 'dateRange'
    },
    {
        key: 'noDeposit7Days',
        category: '用户基础标签',
        name: '大于7日注册未存款',
        definition: '会员注册后大于7日没有存款记录',
        type: 'single',
        options: ['是', '否']
    },
    {
        key: 'age',
        category: '用户基础标签',
        name: '年龄',
        definition: '用户真实身份证年龄',
        type: 'numberRange'
    },
    {
        key: 'gender',
        category: '用户基础标签',
        name: '性别',
        definition: '用户真实身份证性别',
        type: 'single',
        options: ['男', '女']
    },
    {
        key: 'location',
        category: '用户基础标签',
        name: '活跃所在地',
        definition:
            '近1个月通过用户最近登录IP拆解明确登陆地区（市区）',
        type: 'multi',
        options: ['北京', '上海', '广州']
    },
    {
        key: 'siteType',
        category: '用户基础标签',
        name: '站点类型',
        definition: '会员所属站点对应的业务类型 S\\K',
        type: 'multi',
        options: ['S', 'K']
    },
    {
        key: 'site',
        category: '用户基础标签',
        name: '用户所属站点',
        definition: '会员所属站点',
        type: 'multi',
        options: ['站点1', '站点2', '站点3']
    },
    {
        key: 'vipLevel',
        category: '用户业务基础标签',
        name: 'VIP 等级',
        definition: '会员当下等级',
        type: 'multi',
        options: ['VIP1', 'VIP2', 'VIP3']
    },
    {
        key: 'withdrawAccountBind',
        category: '用户业务基础标签',
        name: '会员是否绑定提款账号',
        definition: '会员是否已绑定提款账号',
        type: 'single',
        options: ['是', '否']
    },
    {
        key: 'walletBalance',
        category: '用户业务基础标签',
        name: '钱包余额',
        definition:
            '会员当下钱包余额 = 中心钱包 + 虚拟币钱包 + 场馆钱包（U 按汇率转换成 R）',
        type: 'numberRange'
    },
    {
        key: 'yuebaoBalance',
        category: '用户业务基础标签',
        name: '余额宝',
        definition: '会员当下“余额宝”余额',
        type: 'numberRange'
    },
    {
        key: 'coinBalance',
        category: '用户业务基础标签',
        name: '金币余额',
        definition: '会员当下金币余额',
        type: 'numberRange'
    },
    {
        key: 'coin30Days',
        category: '用户业务基础标签',
        name: '近 30 日打赏的金币总合',
        definition: '会员近 30 日打赏的金币总额',
        type: 'numberRange'
    },
    {
        key: 'memberTag',
        category: '用户业务基础标签',
        name: '会员标签',
        definition: '会员标签管理中业务大的标签类型',
        type: 'text'
    },
    {
        key: 'active7Days',
        category: '用户业务行为标签',
        name: '是否近7日活跃',
        definition: '会员近7日有过登陆即为活跃',
        type: 'single',
        options: ['是', '否']
    },
    {
        key: 'device30Days',
        category: '用户业务行为标签',
        name: '近30日常用设备系统',
        definition: '会员近30日登陆设备枚举（系统版本）',
        type: 'multi',
        options: ['iOS', 'Android', 'Windows']
    },
    {
        key: 'depositChannel30Days',
        category: '用户业务行为标签',
        name: '近30日常用存款渠道',
        definition: '会员近90日使用的存款渠道',
        type: 'multi',
        options: ['渠道1', '渠道2', '渠道3']
    },
    {
        key: 'depositAmount30Days',
        category: '用户业务行为标签',
        name: '近30日存款区间',
        definition: '会员近30日使用的存款订单对应的总金额',
        type: 'numberRange'
    },
    {
        key: 'depositCount30Days',
        category: '用户业务行为标签',
        name: '近30日存款次数',
        definition: '会员近90日使用的存款次数',
        type: 'numberRange'
    },
    {
        key: 'withdrawChannel30Days',
        category: '用户业务行为标签',
        name: '近30日常用提款渠道',
        definition: '会员近90日使用的提款渠道 Top5',
        type: 'multi',
        options: ['渠道1', '渠道2', '渠道3']
    },
    {
        key: 'withdrawAmount30Days',
        category: '用户业务行为标签',
        name: '近30日提款额度区间',
        definition: '会员近30日提款订单对应的金额',
        type: 'numberRange'
    },
    {
        key: 'depositWithdrawRateTotal',
        category: '用户业务行为标签',
        name: '总存提比例',
        definition: '会员从注册开始存提比例',
        type: 'numberRange'
    },
    {
        key: 'depositWithdrawRate30Days',
        category: '用户业务行为标签',
        name: '近30日存提比例',
        definition: '会员近30日存提比例',
        type: 'numberRange'
    },
    {
        key: 'venuePreference30Days',
        category: '用户业务行为标签',
        name: '近30日场馆偏好',
        definition: '会员有游戏投注记录的场馆',
        type: 'multi',
        options: ['场馆A', '场馆B', '场馆C']
    },
    {
        key: 'gamePreference30Days',
        category: '用户业务行为标签',
        name: '近30日场馆–游戏偏好',
        definition: '会员有游戏投注记录的具体游戏',
        type: 'multi',
        options: ['游戏A', '游戏B', '游戏C']
    },
    {
        key: 'betCount7Days',
        category: '用户业务行为标签',
        name: '近7日投注笔数',
        definition: '会员近7日投注总笔数',
        type: 'numberRange'
    },
    {
        key: 'betAmount7Days',
        category: '用户业务行为标签',
        name: '近7日投注金额',
        definition: '会员近7日投注总金额',
        type: 'numberRange'
    },
    {
        key: 'totalWinLose',
        category: '用户业务行为标签',
        name: '总输赢',
        definition: '会员从注册开始总输赢情况（正负）',
        type: 'numberRange'
    },
    {
        key: 'winLose7Days',
        category: '用户业务行为标签',
        name: '近7日总输赢',
        definition: '会员近7日总输赢情况（正负）',
        type: 'numberRange'
    },
    {
        key: 'channelView',
        category: '用户浏览行为标签',
        name: '用户频道浏览',
        definition: '近3日频道页面点击，频道枚举',
        type: 'multi',
        options: ['频道1', '频道2', '频道3']
    },
    {
        key: 'sportVenueView',
        category: '用户浏览行为标签',
        name: '近3日体育场馆有浏览',
        definition: '近3日体育场馆页面点击，体育场馆枚举',
        type: 'multi',
        options: ['体育场馆1', '体育场馆2']
    },
    {
        key: 'liveVenueView',
        category: '用户浏览行为标签',
        name: '近3日真人场馆有浏览',
        definition: '近3日真人场馆页面点击，真人场馆枚举',
        type: 'multi',
        options: ['真人场馆1', '真人场馆2']
    },
    {
        key: 'chessVenueView',
        category: '用户浏览行为标签',
        name: '近3日棋牌场馆有浏览',
        definition: '近3日棋牌场馆页面点击，棋牌场馆枚举',
        type: 'multi',
        options: ['棋牌场馆1', '棋牌场馆2']
    },
    {
        key: 'esportVenueView',
        category: '用户浏览行为标签',
        name: '近3日电竞场馆有浏览',
        definition: '近3日电竞场馆页面点击，电竞场馆枚举',
        type: 'multi',
        options: ['电竞场馆1', '电竞场馆2']
    },
    {
        key: 'lotteryVenueView',
        category: '用户浏览行为标签',
        name: '近3日彩票场馆有浏览',
        definition: '近3日彩票场馆页面点击，彩票场馆枚举',
        type: 'multi',
        options: ['彩票场馆1', '彩票场馆2']
    },
    {
        key: 'electronicVenueView',
        category: '用户浏览行为标签',
        name: '近3日电子场馆有浏览',
        definition: '近3日电子场馆页面点击，电子场馆枚举',
        type: 'multi',
        options: ['电子场馆1', '电子场馆2']
    },
    {
        key: 'entVenueView',
        category: '用户浏览行为标签',
        name: '近3日娱乐场馆有浏览',
        definition: '近3日娱乐场馆页面点击，娱乐场馆枚举',
        type: 'multi',
        options: ['娱乐场馆1', '娱乐场馆2']
    },
    {
        key: 'couponActiveView',
        category: '用户浏览行为标签',
        name: '近3日用户优惠活跃',
        definition: '近3日活动页面点击，活动类型复选',
        type: 'multi',
        options: ['活动1', '活动2', '活动3']
    },
    {
        key: 'cnDepositRate30Days',
        category: '用户财务通道标签',
        name: '过去30日人民币存款占比',
        definition: '过去30日人民币存款总额 ÷ 总存款总额（%）',
        type: 'numberRange'
    },
    {
        key: 'usdtDepositRate30Days',
        category: '用户财务通道标签',
        name: '过去30日虚拟币存款占比',
        definition: '过去30日虚拟币存款总额 ÷ 总存款总额（%）',
        type: 'numberRange'
    },
    {
        key: 'withdrawRejectCount',
        category: '用户风控标签',
        name: '用户提款订单被拒次数',
        definition: '过往1年提款被拒次数',
        type: 'numberRange'
    },
    {
        key: 'withdrawRejectType',
        category: '用户风控标签',
        name: '用户提款订单被拒风控类型',
        definition: '过往1年提款被拒风控类型',
        type: 'multi',
        options: ['类型1', '类型2', '类型3']
    },
    {
        key: 'warningCount',
        category: '用户风控标签',
        name: '用户预警次数',
        definition: '过往1年风控预警次数',
        type: 'numberRange'
    },
    {
        key: 'warningType',
        category: '用户风控标签',
        name: '用户预警业务类型',
        definition: '多账号套利/软件投注/同设备多账号/真人跨平台对冲/套佣金会员等',
        type: 'multi',
        options: ['多账号套利', '软件投注', '同设备多账号']
    },
    {
        key: 'blackUser',
        category: '用户风控标签',
        name: '是否为黑名单用户',
        definition: '该账号手机号或设备与黑名单重合即为黑名单用户',
        type: 'single',
        options: ['是', '否']
    },
    {
        key: 'greyUser',
        category: '用户风控标签',
        name: '是否为灰名单用户',
        definition: '该账号手机号或设备与灰名单重合即为灰名单用户',
        type: 'single',
        options: ['是', '否']
    },
    {
        key: 'activeTime',
        category: '用户行为喜好标签',
        name: '用户活跃时间段',
        definition: '统计过去两周每天登录/点击次数，取每日Top3及重合Top5时区',
        type: 'multi',
        options: [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22',
            '23',
            '24'
        ]
    }
]
