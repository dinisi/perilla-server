# 部署指南
## 主服务器
要求：
1. nodejs
2. yarn
3. mongodb
4. redis
请注意：mongodb和redis并不一定需要安装在本地

步骤：
1. 执行`git clone https://github.com/ZhangZisu/LightOnlineJudge.git`
2. 执行`cd LightOnlineJudge`
3. 执行`yarn`
4. 执行`node cli init`，按照提示输入信息
5. 系统会自动初始化服务器
6. 部署成功。运行`yarn start`启动，安装`pm2`后可以使用`pm2 start`以守护形式运行

安装UI(可选)：
1. 执行`git submodule init`
2. 执行`git submodule update`
3. 执行`cd ui && yarn && yarn build`编译UI

## 评测客户端
要求：
1. 请阅读沙箱依赖：[simple-sandbox](https://github.com/t123yh/simple-sandbox#prerequisites)。
2. nodejs
3. yarn
4. root权限
5. 访问redis服务器

步骤：
1. 执行`git clone https://github.com/ZhangZisu/LightJudger.git`
2. 执行`cd LightJudger`
3. 执行`yarn`
4. 安装`typescript`：`yarn global add typescript`
5. 编译代码：`tsc`
6. 配置启动文件：`cp start.example.js start.js`
7. 按照提示修改`start.js`中的对应部分
