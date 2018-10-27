import { NextFunction, Request } from "express";
import { Document, DocumentQuery } from "mongoose";
import { IRESTRequest, IRESTResponse } from "../../interfaces/route";

type IHandleFunction = (req: IRESTRequest, res: IRESTResponse, next?: NextFunction) => Promise<void> | void;

export const RESTWarp = (handle: IHandleFunction) => {
    return async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
        try {
            await handle(req, res, next);
        } catch (e) {
            return res.RESTFail(e.message);
        }
    };
};

export const PaginationGuard = (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    req.checkQuery("skip", "Invalid skip").isNumeric();
    req.checkQuery("limit", "Invalid limit").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        return res.RESTFail(errors.map((_: any) => _.msg).join());
    } else {
        req.pagination = {
            skip: parseInt(req.query.skip, 10),
            limit: parseInt(req.query.limit, 10),
        };
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

export const extendQuery = <T extends Document>(origin: DocumentQuery<T[], T>, req: IRESTRequest) => {
    if (req.query.control) {
        origin = origin.where(JSON.parse(req.query.control));
    }
    if (req.query.sort) {
        origin = origin.sort(JSON.parse(req.query.sort));
    }
    return origin;
};
