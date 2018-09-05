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
