import { Router } from "express";
import { NextFunction } from "connect";
import { APIRouter } from "./api";

export let router = Router();

router.use(
    '/api',
    async (req, res, next) => {
        //
        next();
    },
    APIRouter
);

