import { Request, Response } from "express";

export interface IRESTResponse extends Response {
    RESTSend(value: any): void;
    RESTFail(message: any): void;
}

export interface IPrivateRequest extends Request {
    entry: string;
    admin: boolean;
}
