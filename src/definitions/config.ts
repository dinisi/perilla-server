import { ICommonAccess } from "./access/common";

export interface ISystemConfig {
    defaultAdminUserID: string;
    defaultAdminRoleID: string;
    defaultJudgerUserID: string;
    defaultJudgerRoleID: string;
    defaultUserRoleID: string;
    defaultCommonAccess: ICommonAccess;
}
