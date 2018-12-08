/**
 * Judger apis
 */

import { Router } from "express";
import { join, resolve } from "path";
import { ERR_NOT_FOUND, JUDGE_PREFIX, MANAGED_FILE_PATH } from "../../constant";
import { llen, rpop } from "../../redis";
import { File } from "../../schemas/file";
import { Solution } from "../../schemas/solution";
import { ensure, isSystemAdmin, RESTWrap } from "../util";

export const JudgerRouter = Router();

JudgerRouter.get("/len", RESTWrap(async (req, res) => {
    res.RESTSend(await llen(req.query.channel, JUDGE_PREFIX));
}));

JudgerRouter.get("/pop", isSystemAdmin, RESTWrap(async (req, res) => {
    const task = await rpop(req.query.channel, JUDGE_PREFIX);
    if (!task) { return res.RESTFail("Empty queue"); }
    res.RESTSend(JSON.parse(task));
}));

JudgerRouter.post("/", isSystemAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findById(req.query.objectID);
    ensure(solution, ERR_NOT_FOUND);
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.details = req.body.details;
    await solution.save();
    res.RESTEnd();
}));

JudgerRouter.get("/resolve", isSystemAdmin, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.owner, id: req.query.id });
    ensure(file, ERR_NOT_FOUND);
    res.RESTSend(file);
}));

JudgerRouter.get("/download", isSystemAdmin, RESTWrap(async (req, res) => {
    const path = resolve(join(MANAGED_FILE_PATH, req.query.hash));
    res.sendFile(path);
}));
