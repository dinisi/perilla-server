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
