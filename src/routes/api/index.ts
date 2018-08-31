import { Router } from "express";
import { AccessRouter } from "./access";
import { FileRouter } from "./file";
import { ProblemRouter } from "./problem";
import { RoleRouter } from "./role";
import { SolutionRouter } from "./solution";
import { UserRouter } from "./user";

export let APIRouter = Router();

APIRouter.use("/access", AccessRouter);

APIRouter.use("/file", FileRouter);
APIRouter.use("/problem", ProblemRouter);
APIRouter.use("/solution", SolutionRouter);
APIRouter.use("/user", UserRouter);
APIRouter.use("/role", RoleRouter);
