import * as fs from "fs-extra";
import { generate } from "randomstring";
import { reloadConfig } from "./config";
import { ISystemConfig } from "./definitions/config";
import "./schemas";
import { IRoleModel, Role } from "./schemas/role";
import { IUserModel, User } from "./schemas/user";

(async () => {
    const defaultConfig: ISystemConfig = {} as ISystemConfig;
    defaultConfig.defaultCommonAccess = {
        createFile: true,
        createProblem: true,
        createRole: false,
        createUser: false,
        modifyRole: false,
        modifyUser: false,
    };
    defaultConfig.defaultFileAccess = { read: false, modify: false };
    defaultConfig.defaultProblemAccess = { read: false, modifyContent: false, modifyData: false, modifyTag: false, remove: false, submit: false };
    defaultConfig.defaultSolutionAccess = { readStatus: false, readResult: false, rejudge: false, remove: false };
    fs.writeFileSync("config.json", JSON.stringify(defaultConfig));
    reloadConfig();

    const defaultAdminRole: IRoleModel = new Role();
    defaultAdminRole.rolename = "Administrators";
    defaultAdminRole.description = "System administrators";
    defaultAdminRole.config = {
        createFile: true,
        createProblem: true,
        createRole: true,
        createUser: true,
        modifyRole: true,
        modifyUser: true,
    };
    defaultAdminRole._protected = true;
    await defaultAdminRole.save();
    defaultConfig.defaultAdminRoleID = defaultAdminRole._id;

    const defaultJudgerRole: IRoleModel = new Role();
    defaultJudgerRole.rolename = "Judgers";
    defaultJudgerRole.description = "System judgers";
    defaultJudgerRole.config = {
        createFile: false,
        createProblem: false,
        createRole: false,
        createUser: false,
        modifyRole: false,
        modifyUser: false,
    };
    defaultJudgerRole._protected = true;
    await defaultJudgerRole.save();
    defaultConfig.defaultJudgerRoleID = defaultJudgerRole._id;

    const defaultUserRole: IRoleModel = new Role();
    defaultUserRole.rolename = "Users";
    defaultUserRole.description = "System users";
    defaultUserRole._protected = true;
    await defaultUserRole.save();
    defaultConfig.defaultUserRoleID = defaultUserRole._id;
    fs.writeFileSync("config.json", JSON.stringify(defaultConfig));
    reloadConfig();

    const defaultAdminUser: IUserModel = new User();
    defaultAdminUser.username = "Administrator";
    defaultAdminUser.realname = "Administrator";
    defaultAdminUser.email = "admin@zhangzisu.cn";
    defaultAdminUser.roles = [defaultConfig.defaultAdminRoleID];
    defaultAdminUser._protected = true;
    const adminPassword = generate(10);
    defaultAdminUser.setPassword(adminPassword);
    // tslint:disable-next-line:no-console
    console.info(`System administrator password: ${adminPassword}`);
    await defaultAdminUser.save();
    defaultConfig.defaultAdminUserID = defaultAdminUser._id;

    const defaultJudgerUser: IUserModel = new User();
    defaultJudgerUser.username = "Judger";
    defaultJudgerUser.realname = "Judger";
    defaultJudgerUser.email = "judger@zhangzisu.cn";
    defaultJudgerUser.roles = [defaultConfig.defaultJudgerRoleID];
    defaultJudgerUser._protected = true;
    const judgerPassword = generate(10);
    defaultJudgerUser.setPassword(judgerPassword);
    // tslint:disable-next-line:no-console
    console.info(`System judger password: ${judgerPassword}`);
    await defaultJudgerUser.save();
    defaultConfig.defaultJudgerUserID = defaultJudgerUser._id;

    fs.writeFileSync("config.json", JSON.stringify(defaultConfig));
    reloadConfig();
})().then(() => { process.exit(0); });
