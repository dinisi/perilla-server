import { Request } from "express";
import { FileAccessConfig } from "../schemas/fileAccess";

export interface AuthorizedRequest extends Request {
    userID: string,
    roleID: string
};

export interface FileRequest extends AuthorizedRequest {
    fileID: string,
    access: FileAccessConfig
}
