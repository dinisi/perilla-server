import { NextFunction, Request } from "express";
import { IRESTResponse } from "../../interfaces/route";

type IHandleFunction = (req: Request, res: IRESTResponse, next?: NextFunction) => Promise<void> | void;

export const RESTWarp = (handle: IHandleFunction) => {
    return async (req: Request, res: IRESTResponse, next: NextFunction) => {
        try {
            await handle(req, res, next);
        } catch (e) {
            res.RESTFail(e.message);
        }
    };
};
