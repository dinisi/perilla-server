import { ICommonAccess, IFileAccessConfig, IProblemAccessConfig, ISolutionAccessConfig } from "./access";

export interface ISystemConfig {
    defaultAdminUserID: string;
    defaultAdminRoleID: string;
    defaultJudgerUserID: string;
    defaultJudgerRoleID: string;
    defaultUserRoleID: string;
    defaultCommonAccess: ICommonAccess;
    defaultFileAccess: IFileAccessConfig;
    defaultProblemAccess: IProblemAccessConfig;
    defaultSolutionAccess: ISolutionAccessConfig;
}
