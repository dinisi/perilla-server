export interface IRoleSimple {
    _id: string;
    rolename: string;
    description: string;
}

export interface IRoleFull extends IRoleSimple {
    MUser: boolean;
    MRole: boolean;
    CProblem: boolean;
    CFile: boolean;
    MAccess: boolean;
}
