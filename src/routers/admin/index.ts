import express from "express";
import { usersRouter } from "./users.router";
const adminRouter = express.Router();

adminRouter.use("/users", usersRouter)

export { adminRouter };
