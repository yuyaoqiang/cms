# 第三方组件样式覆盖使用指南

## 使用方法

已经在 `src/main.tsx` 中引入了样式文件，可以直接使用以下类名：

## 1. Modal 弹窗样式

```jsx
// 保存画像弹窗
<ModalForm
    title="保存用户画像"
    modalProps={{
        className: 'save-profile-modal',
        width: 480
    }}
>
    <ProFormText
        name="name"
        className="enhanced-input"
        fieldProps={{
            className: 'w-full'
        }}
    />
</ModalForm>

// 通用增强弹窗
<ModalForm
    title="标题"
    modalProps={{
        className: 'enhanced-modal'
    }}
>
    {/* 表单内容 */}
</ModalForm>
```

## 2. Drawer 抽屉样式

```jsx
<DrawerForm
    title="配置标签"
    drawerProps={{
        className: 'enhanced-drawer',
        width: 600
    }}
>
    {/* 表单内容 */}
</DrawerForm>
```

## 3. Form 表单样式

```jsx
<div className="enhanced-form">
    <ProFormText
        name="name"
        label="名称"
        className="enhanced-input"
    />
    
    <ProFormSelect
        name="type"
        label="类型"
        className="enhanced-select"
        options={[
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
        ]}
    />
</div>
```

## 4. 按钮样式

```jsx
<Button className="gradient-button">
    保存
</Button>
```

## 5. 卡片样式

```jsx
<Card className="enhanced-card">
    <div>卡片内容</div>
</Card>
```

## 6. 表格样式

```jsx
<ProTable
    className="enhanced-table"
    columns={columns}
    dataSource={data}
/>
```

## 7. 日期选择器样式

```jsx
<ProFormDatePicker
    name="date"
    label="日期"
    className="enhanced-date-picker"
/>
```

## 8. 复选框/单选框样式

```jsx
<ProFormCheckbox.Group
    name="checkbox"
    label="多选"
    className="enhanced-checkbox"
    options={options}
/>

<ProFormRadio.Group
    name="radio"
    label="单选"
    className="enhanced-radio"
    options={options}
/>
```

## 9. 工具类样式

```jsx
// 隐藏标签
<ProFormText
    name="name"
    label="名称"
    className="no-label"
/>

// 紧凑间距
<div className="compact-form">
    <ProFormText name="field1" />
    <ProFormText name="field2" />
</div>

// 无边框输入框
<ProFormText
    name="name"
    className="borderless-input"
/>
```

## 10. 动画效果

```jsx
<div className="fade-in">
    {/* 淡入动画 */}
</div>

<div className="slide-in">
    {/* 滑入动画 */}
</div>
```

## 自定义CSS变量

如果需要调整主题色，可以在组件中覆盖CSS变量：

```jsx
<div style={{
    '--primary-gradient': 'linear-gradient(135deg, #your-color1 0%, #your-color2 100%)',
    '--form-item-margin': '20px'
}}>
    {/* 你的组件 */}
</div>
```

## 样式优先级

文件中的样式按照以下优先级生效：
1. 内联样式 (style属性)
2. 组件 className
3. 全局样式覆盖

## 常用场景示例

### 场景1：创建一个美观的设置弹窗
```jsx
<ModalForm
    title="系统设置"
    modalProps={{
        className: 'enhanced-modal',
        width: 600
    }}
>
    <div className="enhanced-form">
        <ProFormText
            name="siteName"
            label="网站名称"
            className="enhanced-input"
        />
        <ProFormSelect
            name="theme"
            label="主题色"
            className="enhanced-select"
            options={themeOptions}
        />
    </div>
</ModalForm>
```

### 场景2：创建一个紧凑的侧边栏表单
```jsx
<DrawerForm
    title="快速配置"
    drawerProps={{
        className: 'enhanced-drawer',
        width: 400
    }}
>
    <div className="compact-form">
        <ProFormText name="field1" className="borderless-input" />
        <ProFormText name="field2" className="borderless-input" />
        <ProFormText name="field3" className="borderless-input" />
    </div>
</DrawerForm>
```

## 注意事项

1. 样式文件已经自动引入，无需额外导入
2. 优先使用预定义的类名，保持样式一致性
3. 如需特殊样式，可以在具体组件中添加自定义CSS
4. 响应式样式已经包含，在移动端会自动适配