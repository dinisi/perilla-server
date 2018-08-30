import { Router } from "express";
import { FileRouter } from "./file";

export let APIRouter = Router();

APIRouter.use('/file', FileRouter);