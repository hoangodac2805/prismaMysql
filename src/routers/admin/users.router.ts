import express from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth/authenticate";
import { authorize } from "../../middlewares/auth/authorize";
import { UsersController } from "../../controllers/users.controller";
import { checkExist } from "../../middlewares/validations/checkExist";
import { UserModel } from "../../database/Users";
import { validateEmailExist, validateSchema } from "../../middlewares/validations/checkValidData";
import { userCreateSchema } from "../../libs/zodSchemas/usersSchema";

const usersRouter = express.Router();
const upload = multer();

usersRouter.post(
  "/create",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  upload.any(),
  validateSchema(userCreateSchema),
  validateEmailExist,
  UsersController.CreateUser
);
usersRouter.get("/getMany", UsersController.GetUsers);
usersRouter.get("/getByID", UsersController.GetUserByID);
usersRouter.get("/getByEmail", UsersController.GetUserByEmail);
usersRouter.get("/getUserParams/:id", UsersController.GetUserParams);
usersRouter.put(
  "/changePassword",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  UsersController.ChangeUserPassword
);
usersRouter.put(
  "/updateEmail",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  UsersController.UpdateEmail
);
usersRouter.delete(
  "/delete",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  UsersController.DeleteUser
);
export { usersRouter };
