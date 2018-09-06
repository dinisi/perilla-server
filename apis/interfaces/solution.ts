export interface ISolutionSimple {
    _id: string;
    problemID: string;
    status: string;
    created: string;
    owner: string;
}

export interface ISolutionFull extends ISolutionSimple {
    files: string[];
    result: object;
    meta: object;
}

export interface ISolutionNewPayload {
    problemID: string;
    files: string[];
}

export interface ISolutionAccess {
    _id: string;
    roleID: string;
    solutionID: string;
    RResult: boolean;
    MContent: boolean;
    DRejudge: boolean;
    DRemove: boolean;
}
