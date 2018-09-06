export interface IProblemSimple {
    _id: string;
    title: string;
    tags: string[];
    owner: string;
    created: Date;
}

export interface IProblemFull extends IProblemSimple {
    content: string;
    data: object;
    meta: object;
}
