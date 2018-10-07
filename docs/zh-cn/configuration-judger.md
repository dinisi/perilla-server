# 评测机配置
当评测机部署成功后，您将在根目录下看到一份`start.example.js`。

执行`cp start.example.js start.js`，并按照提示修改其中的内容

运行`node start.js`以启动。

以下是几个示范例子：

## 基本配置
```javascript
const redis = require("redis");
const promisifyAll = require("bluebird").promisifyAll;

promisifyAll(redis);
const instance = redis.createClient();

const config = {
    cgroup: "test",                    // Cgroup, for sandbox
    chroot: "/path/to/rootfs",         // Your RootFS path
    server: "your server",             // Your perilla server
    username: "your username",         // Your perilla username
    password: "your password",         // Your perilla password
};

(async () => {
    const perillaJudger = require("./dist");
    // Register plugins
    // Direct (submit-answer) (提交答案)
    const DirectPlugin = require("./dist/direct").default;
    perillaJudger.registerPlugin(new DirectPlugin());
    // Traditional (传统题)
    const traditional = require("./dist/traditional").default;
    perillaJudger.registerPlugin(new traditional());
    // Virtual (虚拟)
    // Please notice that VirtualPlugin constructor need a list of Robots
    // see src/virtual/robots for details
    // 注意VirtualPlugin初始化需要传入一个Robot列表
    const virtual = require("./dist/virtual").default;
    const POJRobot = require("./dist/virtual/robots/poj").default;
    //const LYDSYRobot = require("./dist/virtual/robots/lydsy").default;
    perillaJudger.registerPlugin(new virtual([
        // 初始化Robot需要传入两个参数：用户名和密码
        new POJRobot("zhangzisu_develop", "123456"),
        //new LYDSYRobot("zhangzisu_develop", "123456")
    ]));
    // Initialize perillaJudger
    await perillaJudger.initialize(config);
    while (true) {
        const solutionID = (await instance.brpopAsync("judgeTask", 300));
        if (solutionID) {
            await perillaJudger.judge(solutionID);
        }
    }
})();
```
