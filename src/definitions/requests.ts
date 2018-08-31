import { Request } from "express";
import { ICommonAccess, IFileAccessConfig, IProblemAccessConfig, ISolutionAccessConfig } from "./access";

export interface IAuthorizedRequest extends Request {
    userID: string;
    roleID: string;
    commonAccess: ICommonAccess;
}

export interface IFileRequest extends IAuthorizedRequest {
    fileID: string;
    access: IFileAccessConfig;
}

export interface IProblemRequest extends IAuthorizedRequest {
    problemID: string;
    access: IProblemAccessConfig;
}

export interface ISolutionRequest extends IAuthorizedRequest {
    solutionID: string;
    access: ISolutionAccessConfig;
}
