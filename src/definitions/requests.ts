import { Request } from "express";
import { IUserModel } from "../schemas/user";

export interface IAuthorizedRequest extends Request {
    user: IUserModel;
}
