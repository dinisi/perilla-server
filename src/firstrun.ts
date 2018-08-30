import * as fs from 'fs-extra';
import { SystemConfig } from './definitions/config';
import { Role, RoleModel } from './schemas/role';

if (fs.existsSync('config.json')) {
    console.error('System is already initialized');
    process.exit(1);
}

(async () => {
    let config: SystemConfig = <SystemConfig>{};

    let defaultAdminRole: RoleModel = new Role();
    defaultAdminRole.rolename = 'Administrators';
    defaultAdminRole.description = 'System administrators';
    defaultAdminRole.config = {
        createUser: true,
        modifyUser: true,
        deleteUser: true,
        createRole: true,
        modifyRole: true,
        deleteRole: true,
    };
    await defaultAdminRole.save();
    config.defaultAdminRoleID = defaultAdminRole._id;

    let defaultJudgerRole: RoleModel = new Role();
    defaultJudgerRole.rolename = 'Judgers';
    defaultJudgerRole.description = 'System judgers';
    defaultJudgerRole.config = {
        createUser: false,
        modifyUser: false,
        deleteUser: false,
        createRole: false,
        modifyRole: false,
        deleteRole: false,
    };
    await defaultJudgerRole.save();
    config.defaultJudgerRoleID = defaultJudgerRole._id;
})();