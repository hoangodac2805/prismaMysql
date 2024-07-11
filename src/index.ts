"use strict";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import { router } from "./routers";


const PORT = process.env.PORT || 8888;
const app = express();
/* ___________CONFIG_APP______________ */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);
console.log(`ENV`, process.env.ENV);
app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}!`);
});
