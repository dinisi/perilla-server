export interface ICommonAccess {
    createUser: boolean;
    modifyUser: boolean;
    createRole: boolean;
    modifyRole: boolean;
    createProblem: boolean;
    createFile: boolean;
}

export interface IFileAccessConfig {
    read: boolean;
    modify: boolean;
}

export interface IProblemAccessConfig {
    read: boolean;
    modifyContent: boolean;
    modifyData: boolean;
    modifyTag: boolean;
    remove: boolean;
    submit: boolean;
}

export interface ISolutionAccessConfig {
    readStatus: boolean;
    readResult: boolean;
    rejudge: boolean;
    remove: boolean;
}
