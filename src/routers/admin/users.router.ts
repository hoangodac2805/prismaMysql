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
import { checkPermission } from "../../middlewares/auth/checkPermission";

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
  checkPermission,
  UsersController.ChangeUserPassword
);
usersRouter.put(
  "/updateEmail",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
  validateEmailExist,
  UsersController.UpdateEmail
);

usersRouter.put(
  "/updateUserName",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
  UsersController.UpdateUserName
);
usersRouter.put(
  "/updateFirstName",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
  UsersController.UpdateFirstName
);

usersRouter.put(
  "/updateLastName",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
  UsersController.UpdateLastName
);

usersRouter.put(
  "/active",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
  UsersController.ActiveUser
);

usersRouter.put(
  "/inactive",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
  UsersController.InactiveUser
);

usersRouter.put(
  "/updateAvatar",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  upload.single("avatar"),
  checkExist(UserModel),
  checkPermission,
  UploadSingle("avatar", STORAGE_DIR.USER_AVATAR, {
    ext: AVATAR_EXT,
  }),
  UsersController.UpdateAvatar
);

usersRouter.put(
  "/updateAvatarByUsed",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
  UsersController.UpdateAvatarByUsed
);

usersRouter.delete(
  "/delete",
  authenticate,
  authorize(["ADMIN", "SUPERADMIN"]),
  checkExist(UserModel),
  checkPermission,
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
