import { Router } from "express";
import { AccessRouter } from "./access";
import { FileRouter } from "./file";

export let APIRouter = Router();

APIRouter.use("/access", AccessRouter);

APIRouter.use("/file", FileRouter);
