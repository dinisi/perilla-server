import { NextFunction, Request, Response } from "express";
import { ServerError } from "../definitions/errors";

export const validPaginate = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.query.skip) { throw new ServerError("Paginate: invalid skip", 403); }
        if (!req.query.limit) { throw new ServerError("Paginate: invalid limit", 403); }
        req.query.skip = parseInt(req.query.skip, 10);
        req.query.limit = parseInt(req.query.limit, 10);
        if (req.query.limit > 256) { throw new ServerError("Limit is too big", 403); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
};
