import express from "express";
import { authenticationRouter } from "./authentication.router";
import { TestRouter } from "./test.router";
const router = express.Router();

router.use("/authentication", authenticationRouter);
router.use("/test", TestRouter);

export { router };
