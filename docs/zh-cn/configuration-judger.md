# 评测机配置
当评测机部署成功后，您将在根目录下看到一份`start.example.js`。

执行`cp start.example.js start.js`，并按照提示修改其中的内容

运行`node start.js`以启动。

以下是几个示范例子：

## 基本配置
这个例子使用的是基本的配置，只会运行一个线程
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
## 使用cluster
这是一个使用cluster的例子。默认会使用cpu个数个线程

注意使用cluster时需要考虑线程安全
```javascript
const PERILLA_SERVER = "http://example.com";
const PERILLA_USER = "username";
const PERILLA_PASS = "password";
const CHROOT_PATH = "/path/to/chroot";

const cluster = require("cluster");
if (cluster.isMaster) {
    const fs = require("fs-extra");
    const path = require("path");
    const file = require("./file");
    const http = require("./http");
    http.initialize(PERILLA_SERVER, PERILLA_USER, PERILLA_PASS).then(() => {
        const TMPPrefix = "tmp";
        const cpuCount = require("os").cpus().length;
        for (let i = 0; i < cpuCount; i++) {
            console.log("[MASTER] starting worker " + i);
            const TMP = path.join(TMPPrefix, "worker_" + i);
            fs.ensureDirSync(TMP);
            fs.emptyDirSync(TMP);
            const worker = cluster.fork({
                WORKER_ID: i,
                TMP_DIR: TMP
            });
            const sendMsg = (type, payload) => {
                worker.send(JSON.stringify({ type, payload }));
            };
            worker.on("message", (message) => {
                try {
                    const parsed = JSON.parse(message);
                    if (parsed.type === "log") {
                        console.log(`[#${i}] ${parsed.payload}`);
                    } else if (parsed.type === "FileReq") {
                        console.log(`File request #${parsed.payload.requestID} @${i}`)
                        file.getFile(parsed.payload.fileID).then(file => {
                            console.log(`File response #${parsed.payload.requestID} @${i} succeed`);
                            sendMsg("FileRes", { file, requestID: parsed.payload.requestID });
                        }).catch(e => {
                            console.log(`File response #${parsed.payload.requestID} @${i} failed`);
                            sendMsg("FileRes", { file: null, requestID: parsed.payload.requestID, error: e.message });
                        });
                    }
                } catch (e) {
                    console.log("Failed process message: " + message);
                }
            });
        }
    });
} else {
    const sendMsg = (type, payload) => {
        process.send(JSON.stringify({ type, payload }));
    };
    let fileResolvers = {};
    let fileRequestCount = 0;
    const resolveFile = (fileID) => {
        return new Promise((resolve, reject) => {
            fileResolvers[fileRequestCount] = { resolve, reject };
            sendMsg("FileReq", { fileID, requestID: fileRequestCount });
            fileRequestCount++;
        });
    };
    process.on("message", (message) => {
        const parsed = JSON.parse(message);
        if (parsed.type === "FileRes") {
            console.log("file response " + parsed.payload.requestID);
            if (parsed.payload.file) {
                fileResolvers[parsed.payload.requestID].resolve(parsed.payload.file);
            } else {
                fileResolvers[parsed.payload.requestID].reject(parsed.payload.error);
            }
            delete fileResolvers[parsed.payload.requestID];
        }
    });

    console.log = (message) => {
        sendMsg("log", message);
    };
    console.log("started");

    const redis = require("redis");
    const promisifyAll = require("bluebird").promisifyAll;

    promisifyAll(redis);
    const instance = redis.createClient();
    const http = require("./http");

    const solution = require("./solution");
    const problem = require("./problem");

    const config = {
        cgroup: "JUDGE" + process.env.WORKER_ID,  // Cgroup, for sandbox
        chroot: CHROOT_PATH,
        resolveSolution: solution.getSolution,
        updateSolution: solution.updateSolution,
        resolveProblem: problem.getProblem,
        resolveFile: resolveFile
    };

    (async () => {
        await http.initialize(PERILLA_SERVER, PERILLA_USER, PERILLA_PASS);

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
        perillaJudger.registerPlugin(new virtual([
            // new POJRobot("zhangzisu_develop", "123456")
        ]));
        // Initialize perillaJudger
        await perillaJudger.initialize(config);
        while (true) {
            const solutionID = (await instance.brpopAsync("judgeTask", 300))[1];
            if (solutionID) {
                console.log(solutionID);
                await perillaJudger.judge(solutionID);
            }
        }
    })();
}
```
## 自定义配置
当然，仅仅是上述配置可能无法满足你的要求。比如：
* 您希望搭建一个类似`lemon`的本地评测环境，用不到和perilla服务器交互
* 您希望自己编写评测插件，来自定义题目的评测过程
* 您希望将perilla-judger集成到您的项目中

您可以通过接口来自定义评测。