export interface IRolesResponse {
    _id: string;
    rolename: string;
    description: string;
}

export interface ILoginPayload {
    username: string;
    password: string;
    rolename: string;
    clientID: string;
}

export interface IRegisterPayload {
    username: string;
    realname: string;
    email: string;
    password: string;
}
