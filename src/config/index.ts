import bcrypt from "bcryptjs"

export const SALTPASS = bcrypt.genSaltSync(10);

export const JWTSALT = 'cyBKB2+Drlu61dgVdLLtoQ=='

const STORAGE_ROOT = "upload/";

export const STORAGE_DIR = {
    USER_AVATAR: STORAGE_ROOT + "user/avatar",
}

export const AVATAR_EXT = ["image/jpeg", "image/png"]