import { UsersController } from "../controllers/authentication.controller";
import express from "express";

const authenticationRouter = express.Router();

authenticationRouter.post("/register", UsersController.Register);
authenticationRouter.post("/login", UsersController.Login);


export { authenticationRouter };
