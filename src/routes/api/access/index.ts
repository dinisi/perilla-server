import { Router } from "express";
import { FileAccessRouter } from "./file";
import { ProblemAccessRouter } from "./problem";
import { SolutionAccessRouter } from "./solution";

export let AccessRouter = Router();

AccessRouter.use("/file", FileAccessRouter);
AccessRouter.use("/problem", ProblemAccessRouter);
AccessRouter.use("/solution", SolutionAccessRouter);
