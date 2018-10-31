import { NextFunction } from "express";
import { Document, DocumentQuery } from "mongoose";
import { IRESTRequest, IRESTResponse } from "../../interfaces/route";
import { EntryMap } from "../../schemas/entryMap";
import { SystemMap } from "../../schemas/systemMap";

type IHandleFunction = (req: IRESTRequest, res: IRESTResponse, next?: NextFunction) => Promise<void> | void;

export const RESTWrap = (handle: IHandleFunction) => {
    return async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
        try {
            await handle(req, res, next);
        } catch (e) {
            return res.RESTFail(e.message);
        }
    };
};

export const normalizeValidatorError = (errors: any[] | Record<string, any>) => {
    if (errors instanceof Array) {
        return errors.map((_) => _.msg).join();
    } else {
        return "" + errors;
    }
};

type IPaginationHandleFunction = (req: IRESTRequest) => DocumentQuery<Document[], Document>;

export const PaginationWrap = (handle: IPaginationHandleFunction) => {
    return RESTWrap((req, res) => {
        let query = handle(req);
        query = extendQuery(query, req);
        if (req.query.noexec) {
            query.countDocuments()
                .then((count) => res.RESTSend(count))
                .catch((err) => res.RESTFail(err.message));
        } else {
            req.checkQuery("skip", "Invalid skip").isNumeric();
            req.checkQuery("limit", "Invalid limit").isNumeric();
            const skip = parseInt(req.query.skip, 10);
            const limit = parseInt(req.query.limit, 10);
            const errors = req.validationErrors();
            if (errors) { return res.RESTFail(normalizeValidatorError(errors)); }
            query.skip(skip).limit(limit)
                .then((result) => res.RESTSend(result))
                .catch((err) => res.RESTFail(err.message));
        }
    });
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

export const isLoggedin = async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    if (!req.isAuthenticated()) { return res.RESTFail("Access denied"); }
    return next();
};

export const isSystemAdmin = async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    const map = await SystemMap.findOne({ user: req.user });
    if (!map) { return res.RESTFail("Access denied"); }
    return next();
};

export const isEntryAdmin = async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    const errors = req.validationErrors();
    if (errors) { return res.RESTFail(normalizeValidatorError(errors)); }
    const entryMap = await EntryMap.findOne({ from: req.user, to: req.query.entry });
    if (entryMap.admin) { return next(); }
    const systemMap = await SystemMap.findOne({ user: req.user });
    if (systemMap) { return next(); }
    return res.RESTFail("Access denied");
};

export const isEntryMember = async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    const errors = req.validationErrors();
    if (errors) { return res.RESTFail(normalizeValidatorError(errors)); }
    const entryMap = await EntryMap.findOne({ from: req.user, to: req.query.entry });
    if (entryMap) { return next(); }
    const systemMap = await SystemMap.findOne({ user: req.user });
    if (systemMap) { return next(); }
    return res.RESTFail("Access denied");
};

export const verifyValidation = async (errors: any[] | Record<string, any>) => {
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
};

export const notNullOrUndefined = (obj: any) => {
    if (obj === null || obj === undefined) { throw new Error("Not found"); }
    return;
};
