import { Request } from "express";
import { IFileAccessConfig } from "../schemas/fileAccess";

export interface IAuthorizedRequest extends Request {
    userID: string;
    roleID: string;
}

export interface IFileRequest extends IAuthorizedRequest {
    fileID: string;
    access: IFileAccessConfig;
}
