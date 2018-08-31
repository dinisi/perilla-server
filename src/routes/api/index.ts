import { Router } from "express";
import { AccessRouter } from "./access";
import { FileRouter } from "./file";
import { ProblemRouter } from "./problem";
import { SolutionRouter } from "./solution";

export let APIRouter = Router();

APIRouter.use("/access", AccessRouter);

APIRouter.use("/file", FileRouter);
APIRouter.use("/problem", ProblemRouter);
APIRouter.use("/solution", SolutionRouter);
