import { authenticate } from "../middlewares/auth/authenticate";
import { AuthenticationController } from "../controllers/authentication.controller";
import express from "express";

const authenticationRouter = express.Router();

authenticationRouter.post("/register", AuthenticationController.Register);
authenticationRouter.post("/login", AuthenticationController.Login);
authenticationRouter.get("/verifyToken",authenticate, AuthenticationController.VerifyToken);


export { authenticationRouter };
