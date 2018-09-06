export interface IFileSimple {
    _id: string;
    type: string;
    created: string;
    owner: string;
}

export interface IFileFull {
    hash: string;
    description: string;
}

export interface IFileAccess {
    _id: string;
    roleID: string;
    fileID: string;
    MContent: boolean;
    DRemove: boolean;
}
