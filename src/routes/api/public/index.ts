import { Router } from "express";
import { publicEntryRouter } from "./entry";
import { publicFileRouter } from "./file";
import { publicProblemRouter } from "./problem";
import { publicSolutionRouter } from "./solution";

export const PublicAPIRouter = Router();

PublicAPIRouter.use("/entry", publicEntryRouter);
PublicAPIRouter.use("/file", publicFileRouter);
PublicAPIRouter.use("/problem", publicProblemRouter);
PublicAPIRouter.use("/solution", publicSolutionRouter);
