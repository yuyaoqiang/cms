## 请求组件说明

项目提供了基于 axios 的请求封装，文件位于 `src/api/request.ts`，已配置请求和响应拦截器，会自动携带本地 token 并在出错时提示。

### 基本用法

```ts
import { get, post } from '@/api'

get('/example').then(({ result }) => {
    console.log(result)
})

post('/submit', { foo: 'bar' })
```
