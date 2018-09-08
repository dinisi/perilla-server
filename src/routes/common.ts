import { NextFunction, Request, Response } from "express";

export const validPaginate = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.query.skip) { throw new Error("Paginate: invalid skip"); }
        if (!req.query.limit) { throw new Error("Paginate: invalid limit"); }
        req.query.skip = parseInt(req.query.skip, 10);
        req.query.limit = parseInt(req.query.limit, 10);
        if (req.query.limit > 256) { throw new Error("Limit is too big"); }
        next();
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
};
