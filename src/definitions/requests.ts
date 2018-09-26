import { Request } from "express";
import { IUserModel } from "../schemas/user";
import { IClient } from "./cache";

export interface IAuthorizedRequest extends Request {
    client: IClient;
}
