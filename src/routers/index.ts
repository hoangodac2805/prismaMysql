import express from "express";
import { authenticationRouter } from "./authentication.router";
import { TestRouter } from "./test.router";
import { adminRouter } from "./admin";
const router = express.Router();

router.use("/authentication", authenticationRouter);
router.use("/admin", adminRouter)
router.use("/test", TestRouter);

export { router };
