import { Router, Response } from "express";
import { NextFunction } from "connect";
import { APIRouter } from "./api";
import { AuthorizedRequest } from "../definitions/requests";

export let router = Router();

router.use(
    '/api',
    async (req: AuthorizedRequest, res: Response, next) => {
        req.userID = '123';
        req.roleID = '456';
        next();
    },
    APIRouter
);

