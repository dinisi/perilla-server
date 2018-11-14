import { NextFunction, Request } from "express";
import { Document, DocumentQuery } from "mongoose";
import { IRESTResponse } from "../../interfaces/route";
import { EntryMap } from "../../schemas/entrymap";
import { SystemMap } from "../../schemas/systemmap";

type IHandleFunction = (req: Request, res: IRESTResponse, next?: NextFunction) => Promise<void> | void;

export const RESTWrap = (handle: IHandleFunction) => {
    return async (req: Request, res: IRESTResponse, next: NextFunction) => {
        try {
            await handle(req, res, next);
        } catch (e) {
            return res.RESTFail(e.message);
        }
    };
};

type IPaginationHandleFunction = (req: Request) => DocumentQuery<Document[], Document>;

export const PaginationWrap = (handle: IPaginationHandleFunction) => {
    return RESTWrap((req, res) => {
        const query = handle(req);
        if (req.query.noexec) {
            query.countDocuments()
                .then((count) => res.RESTSend(count))
                .catch((err) => res.RESTFail(err.message));
        } else {
            const skip = parseInt(req.query.skip, 10);
            const limit = parseInt(req.query.limit, 10);
            query.skip(skip).limit(limit)
                .then((result) => res.RESTSend(result))
                .catch((err) => res.RESTFail(err.message));
        }
    });
};

export const isLoggedin = async (req: Request, res: IRESTResponse, next: NextFunction) => {
    if (!req.isAuthenticated()) { return res.RESTFail("Access denied"); }
    return next();
};

export const isSystemAdmin = async (req: Request, res: IRESTResponse, next: NextFunction) => {
    const map = await SystemMap.findOne({ user: req.user });
    if (!map) { return res.RESTFail("Access denied"); }
    return next();
};

export const isEntryAdmin = async (req: Request, res: IRESTResponse, next: NextFunction) => {
    const entryMap = await EntryMap.findOne({ from: req.user, to: req.query.entry });
    if (entryMap.admin) { return next(); }
    const systemMap = await SystemMap.findOne({ user: req.user });
    if (systemMap) { return next(); }
    return res.RESTFail("Access denied");
};

export const isEntryMember = async (req: Request, res: IRESTResponse, next: NextFunction) => {
    const entryMap = await EntryMap.findOne({ from: req.user, to: req.query.entry });
    if (entryMap) { return next(); }
    const systemMap = await SystemMap.findOne({ user: req.user });
    if (systemMap) { return next(); }
    return res.RESTFail("Access denied");
};

export const notNullOrUndefined = (obj: any) => {
    if (obj === null || obj === undefined) { throw new Error("Not found"); }
    return;
};
