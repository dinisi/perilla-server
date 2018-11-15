/**
 * Judger apis
 */

import { Router } from "express";
import { join, resolve } from "path";
import { File, managedFilePath } from "../../schemas/file";
import { Solution } from "../../schemas/solution";
import { Task } from "../../schemas/task";
import { isLoggedin, isSystemAdmin, notNullOrUndefined, RESTWrap } from "./util";

export const JudgerRouter = Router();
let queueLength = 0;

export const pushQueue = () => { queueLength++; };

JudgerRouter.get("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    if (!queueLength) {
        return res.RESTFail("Empty queue");
    }
    const task = await Task.findOneAndRemove().where("channel").in(req.query.channel);
    notNullOrUndefined(task);
    if (!task) {
        return res.RESTFail("Empty queue");
    }
    queueLength--;
    res.RESTSend(task);
}));

JudgerRouter.post("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findById(req.query.objectID);
    notNullOrUndefined(solution);
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.details = req.body.details;
    await solution.save();
    res.RESTEnd();
}));

JudgerRouter.get("/resolve", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.owner, id: req.query.id });
    notNullOrUndefined(file);
    res.RESTSend(file);
}));

JudgerRouter.get("/download", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    const path = resolve(join(managedFilePath, req.query.hash));
    res.sendFile(path);
}));
