# 部署

## 要求
1. nodejs
2. yarn
3. mongodb
4. redis
请注意：mongodb和redis并不一定需要安装在本地

## 步骤
1. 执行`git clone https://github.com/ZhangZisu/perilla.git`
2. 执行`cd perilla`
3. 执行`yarn`
4. 执行`node cli init`，按照提示输入信息
5. 系统会自动初始化服务器
6. 部署成功。运行`yarn start`启动，安装`pm2`后可以使用`pm2 start`以守护形式运行

## 安装UI(可选)
1. 执行`git submodule init`
2. 执行`git submodule update`
3. 执行`cd ui && yarn && yarn build`编译UI