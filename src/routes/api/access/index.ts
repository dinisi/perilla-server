import { Router } from "express";
import { FileAccessRouter } from "./file";

export let AccessRouter = Router();

AccessRouter.use("/file", FileAccessRouter);
