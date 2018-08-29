import { Router } from "express";
import { FileRouter } from "./file";

export let FileIndexRouter = Router();

FileIndexRouter.use(
    '/:id',
    async (req, res, next) => {
        let id = req.params.id;
        //
        next();
    },
    FileRouter
);