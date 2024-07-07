import { UsersController } from "../controllers/users.controller";
import express from "express";

const authenticationRouter = express.Router();
authenticationRouter.post("/register", UsersController.CreateUser);

export { authenticationRouter };
