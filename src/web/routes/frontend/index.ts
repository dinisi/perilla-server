import express = require("express");
import { FRONTEND_PATH } from "../../../constant";

export const FrontendRouter = express.Router();

FrontendRouter.use(express.static(FRONTEND_PATH));
