import "./config";
import "./redis";
import "./schemas";

import { json, urlencoded } from "body-parser";
import * as express from "express";
import { MainRouter } from "./routes";

const app: express.Application = express();

const port: number = parseInt(process.env.PORT, 10) || 3000;

app.use(json());
app.use(urlencoded({ extended: false }));

app.use(MainRouter);

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Listening on port ${port}`);
});
