import { Request } from "express";
import { IFileAccessModel } from "../schemas/fileAccess";
import { IProblemAccessModel } from "../schemas/problemAccess";
import { IRoleModel } from "../schemas/role";
import { ISolutionAccessModel } from "../schemas/solutionAccess";

export interface IAuthorizedRequest extends Request {
    userID: string;
    roleID: string;
    role: IRoleModel;
}

export interface IFileRequest extends IAuthorizedRequest {
    fileID: string;
    access: IFileAccessModel;
}

export interface IProblemRequest extends IAuthorizedRequest {
    problemID: string;
    access: IProblemAccessModel;
}

export interface ISolutionRequest extends IAuthorizedRequest {
    solutionID: string;
    access: ISolutionAccessModel;
}

export interface IFileAccessRequest extends IAuthorizedRequest {
    fileAccess: IFileAccessModel;
}

export interface IProblemAccessRequest extends IAuthorizedRequest {
    problemAccess: IProblemAccessModel;
}

export interface ISolutionAccessRequest extends IAuthorizedRequest {
    solutionAccess: ISolutionAccessModel;
}
