# 部署

## 要求
1. 请阅读沙箱依赖：[simple-sandbox](https://github.com/t123yh/simple-sandbox#prerequisites)。
2. nodejs
3. yarn
4. root权限
5. 访问redis服务器

## 步骤
1. 执行`git clone https://github.com/ZhangZisu/perilla-judger.git`
2. 执行`cd perilla-judger`
3. 执行`yarn`
4. 安装`typescript`：`yarn global add typescript`
5. 编译代码：`tsc`
6. 配置启动文件：`cp start.example.js start.js`
7. 按照提示修改`start.js`中的对应部分
