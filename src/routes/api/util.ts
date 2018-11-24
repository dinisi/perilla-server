import { NextFunction } from "express";
import { Document, DocumentQuery } from "mongoose";
import { ERR_ACCESS_DENIED, ERR_INVALID_REQUEST } from "../../constant";
import { IRESTRequest, IRESTResponse } from "../../interfaces/route";
import { EntryMap } from "../../schemas/entrymap";
import { SystemMap } from "../../schemas/systemmap";

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

type IPaginationHandleFunction = (req: IRESTRequest) => DocumentQuery<Document[], Document>;

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

export const verifyEntryAccess = RESTWrap(async (req, res, next) => {
    if (!req.isAuthenticated()) { throw new Error(ERR_ACCESS_DENIED); }
    if (!req.query.entry) { throw new Error(ERR_INVALID_REQUEST); }
    if (req.query.forced) {
        // Match system admin table
        const map = await SystemMap.findOne({ user: req.user });
        if (!map) { throw new Error(ERR_ACCESS_DENIED); }
        req.admin = true;
        return next();
    } else {
        const map = await EntryMap.findOne({ from: req.user, to: req.query.entry });
        if (!map) { throw new Error(ERR_ACCESS_DENIED); }
        if (map.admin) {req.admin = true; }
        return next();
    }
});

export const ensure = (value: any, message: string) => {
    if (!value) {throw new Error(message); }
};

export const isLoggedin = async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    if (!req.isAuthenticated()) { return res.RESTFail(ERR_ACCESS_DENIED); }
    return next();
};

export const isSystemAdmin = async (req: IRESTRequest, res: IRESTResponse, next: NextFunction) => {
    const map = await SystemMap.findOne({ user: req.user });
    if (!map) { return res.RESTFail(ERR_ACCESS_DENIED); }
    return next();
};
