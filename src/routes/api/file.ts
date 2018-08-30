import { Router, Response } from "express";
import { FileRequest } from "../../definitions/requests";
import { FileAccess } from "../../schemas/fileAccess";
import { ServerError } from "../../definitions/errors";
import * as path from "path";

export let FileRouter = Router();

FileRouter.use('/:id', async (req: FileRequest, res: Response, next) => {
    try {
        let fileID = req.params.id;
        let access = await FileAccess.findOne({ roleID: req.roleID, fileID: fileID });
        if (!access) throw new ServerError('Not found', 404);
        req.fileID = fileID;
        req.access = access.config;
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.send(e.message).status(e.code);
        } else {
            res.send(e.message).status(500);
        }
    }
});

FileRouter.get('/:id/download', async (req: FileRequest, res: Response) => {
    try {
        if (!req.access.read) throw new ServerError('No access', 403);
        res.sendFile(path.join('files', 'managed', req.fileID));
    } catch (e) {
        if (e instanceof ServerError) {
            res.send(e.message).status(e.code);
        } else {
            res.send(e.message).status(500);
        }
    }
});

