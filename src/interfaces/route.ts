import { Request, Response } from "express";

export interface IRESTResponse extends Response {
    RESTSend(value: any): void;
    RESTFail(message: any): void;
    RESTEnd(): void;
}
