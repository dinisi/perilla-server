import { Router } from "express";
import { File } from "../../schemas/file";
import { Message } from "../../schemas/message";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { isLoggedin, isSystemAdmin, PaginationWrap } from "./util";

export const adminRouter = Router();

adminRouter.get("/message", isLoggedin, isSystemAdmin, PaginationWrap(() => Message.find()));
adminRouter.get("/file", isLoggedin, isSystemAdmin, PaginationWrap(() => File.find()));
adminRouter.get("/problem", isLoggedin, isSystemAdmin, PaginationWrap(() => Problem.find()));
adminRouter.get("/solution", isLoggedin, isSystemAdmin, PaginationWrap(() => Solution.find()));
