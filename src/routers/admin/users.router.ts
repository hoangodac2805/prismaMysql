import express from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth/authenticate";
import { authorize } from "../../middlewares/auth/authorize";
import { UsersController } from "../../controllers/users.controller";
import { checkExist } from "../../middlewares/validations/checkExist";
import { UserModel } from "../../database/Users";
import {
  validateEmailExist,
  validateSchema,
} from "../../middlewares/validations/checkValidData";
import { userCreateSchema } from "../../libs/zodSchemas/usersSchema";
import { UploadSingle } from "../../middlewares/upload/uploadSingle";
import { AVATAR_EXT, STORAGE_DIR } from "../../config";

const usersRouter = express.Router();
const upload = multer();

usersRouter.post(
  "/create",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  upload.single("avatar"),
  UploadSingle("avatar", STORAGE_DIR.USER_AVATAR, {
    ext: AVATAR_EXT,
  }),
  validateSchema(userCreateSchema),
  validateEmailExist,
  UsersController.CreateUser
);
usersRouter.get("/getMany", UsersController.GetUsers);
usersRouter.get("/getByID", checkExist(UserModel), UsersController.GetUserByID);
usersRouter.get(
  "/getByEmail",
  checkExist(UserModel, "email"),
  UsersController.GetUserByEmail
);
usersRouter.get(
  "/getUserParams/:id",
  checkExist(UserModel),
  UsersController.GetUserParams
);
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

usersRouter.put(
  "/updateAvatar",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  upload.single("avatar"),
  checkExist(UserModel),
  UploadSingle("avatar", STORAGE_DIR.USER_AVATAR, {
    ext: AVATAR_EXT,
  }),
  UsersController.UpdateAvatar
);
usersRouter.delete(
  "/delete",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  UsersController.DeleteUser
);

usersRouter.post(
  "/test",
  upload.single("avatar"),
  UploadSingle("avatar", STORAGE_DIR.USER_AVATAR, {
    ext: AVATAR_EXT,
  }),
  (req, res) => {
    console.log(`req.body.avatar`, req.body.avatar);
  }
);

export { usersRouter };
