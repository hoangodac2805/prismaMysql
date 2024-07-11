import express from "express";
import multer from "multer"
import { authenticate } from "../../middlewares/auth/authenticate";
import { authorize } from "../../middlewares/auth/authorize";
import { UsersController } from "../../controllers/users.controller";

const usersRouter = express.Router();
const upload = multer();

usersRouter.post("/create", authenticate, authorize(["ADMIN", "SUPERADMIN"]), upload.any(), UsersController.CreateUser);
usersRouter.get("/getMany", UsersController.GetUsers);

export { usersRouter }