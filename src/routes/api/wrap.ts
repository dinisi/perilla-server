import { NextFunction, Request } from "express";
import { IRESTRequest, IRESTResponse } from "../../interfaces/route";

type IHandleFunction = (req: IRESTRequest, res: IRESTResponse, next?: NextFunction) => Promise<void> | void;

export const RESTWarp = (handle: IHandleFunction) => {
    return async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
        try {
            await handle(req, res, next);
        } catch (e) {
            res.RESTFail(e.message);
        }
    };
};

export const PaginationGuard = (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    req.checkQuery("skip").isNumeric();
    req.checkQuery("limit").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        return res.RESTFail(errors.map((_: any) => _.msg).join());
    } else {
        return next();
    }
};

export const normalizeValidatorError = (errors: any[] | Record<string, any>) => {
    if (errors instanceof Array) {
        return errors.map((_) => _.msg).join();
    } else {
        return "" + errors;
    }
};
