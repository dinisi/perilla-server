export interface IUserSimple {
    _id: string;
    username: string;
    realname: string;
    roles: string[];
}

export interface IUserFull extends IUserSimple {
    email: string;
    bio: string;
}

export interface IUserNewPayload extends IUserSimple {
    password: string;
}
