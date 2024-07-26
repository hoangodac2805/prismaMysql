import { Prisma, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateFieldToSelect } from "../utils";

export const SALTPASS = bcrypt.genSaltSync(10);

export const JWTSALT = "cyBKB2+Drlu61dgVdLLtoQ==";

const STORAGE_ROOT = "upload/";

export const STORAGE_DIR = {
  USER_AVATAR: STORAGE_ROOT + "user/avatar",
};

export const AVATAR_EXT = ["image/jpeg", "image/png"];

export const USER_FIELD_SELECT = {
  COMMON: generateFieldToSelect<Prisma.UserSelect>([
    "id",
    "email",
    "userName",
    "lastName",
    "firstName",
    "avatar",
    "usedAvatars",
    "isActive",
    "tokenVersion",
    "role",
    "createdAt",
    "updatedAt",
  ]),
};
