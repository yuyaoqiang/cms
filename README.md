测试环境地址：
http://fat-linghuiadmin.q6b642a1.com/

测试环境账号：
carter@yabotiyu.net 12345678a

生产环境地址：
https://linghuiadmin.tech/

生产环境账号：
没生产环境账号，只有使用人员才有，如ada

环境：
nodejs: v22.0.0

安装依赖：
pnpm i
必须执行 `pnpm install` 以安装 ESLint、Prettier 所需插件
运行 `npm run lint`、`npm run prettier` 可确保提交符合团队规范

开发命令:
npm run dev

构建测试环境包:
npm run build:dev

构建生产环境包:
npm run build

发布测试环境的包：
<手动上传dist包>

1.访问：http://fat-houtu-jenkins.q6b642a1.com/view/CI%20NODE%20NEW/job/NODE_UPLOAD_DISTFILE/build?delay=0sec

2.下拉选择financial_manager

3.上传dist.zip包

4.找到构建记录file_path的值，如：financial_manager_20240904132204

<发布dist包>

5.访问：http://fat-houtu-jenkins.q6b642a1.com/view/FAT%20CD/job/FAT_NODE_DEPLOY_PIPELINE/build?delay=0sec

6.EVN选test，PROJECT选financial_manager，file_path填上面的值如：financial_manager_20240904132204

7.点Build然后等待更新8.访问http://fat-linghuiadmin.q6b642a1.com/，然后控制台输入_version查看是否更新成功

备注：
生产环境更新也是手动构建包然后上传到Jenkins得到包链接，然后用包链接申请上线让运维更新
运维对接人：shlomo, jackhan, karuna, tofu
