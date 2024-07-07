import express from "express";
import { authenticationRouter } from "./authentication.router";
const router = express.Router();

router.use("/authentication", authenticationRouter);

export { router };
