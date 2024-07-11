import { AuthenticationController } from "../controllers/authentication.controller";
import express from "express";

const authenticationRouter = express.Router();

authenticationRouter.post("/register", AuthenticationController.Register);
authenticationRouter.post("/login", AuthenticationController.Login);


export { authenticationRouter };
