import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserModel } from "../database/Users";
import { Role, User } from "@prisma/client";
import {
  convertArrayFileToObject,
  createBooleanCondition,
  createPaginate,
  generateFieldToSelect,
  getPriorityRole,
  handleGetNumber,
  isNumber,
  validateFile,
} from "../utils";
import {
  AVATAR_EXT,
  STORAGE_DIR,
  SALTPASS,
  USER_FIELD_SELECT,
} from "../config";
import { HTTPSTATUS } from "../enums/HttpStatus";
import { ERRORTYPE } from "../enums/ErrorType";
import { deleteFileFromFireBase, uploadToFireBase } from "../services/firebase";
import {
  emailSchema,
  passwordSchema,
  userCreateSchema,
} from "../libs/zodSchemas/usersSchema";
import { getUsersWithQuery } from "../services/userService";
import { error } from "console";

const CreateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { username, firstName, lastName, email, password, Role } = req.body;
    
    const files = convertArrayFileToObject(req);
    let { avatar } = files;

    
    if (avatar) {
      let validateFileProcess = validateFile(avatar, AVATAR_EXT);
      if (!validateFileProcess.status) {
        return res.status(HTTPSTATUS.BAD_REQUEST).send({
          name: ERRORTYPE.DATA_ERROR,
          issues: {
            message: validateFileProcess.message,
          },
        });
      }
    }

    let { fileName, downloadURL: avatarURL } = avatar
      ? (await uploadToFireBase(avatar, STORAGE_DIR.USER_AVATAR)).data
      : { fileName: null, downloadURL: null };

    const hashPass = bcrypt.hashSync(password, SALTPASS);
    
    UserModel.create({
      data: {
        username,
        lastName,
        firstName,
        email,
        Role,
        password: hashPass,
        avatar: avatarURL,
      },
    })
      .then((user) => {
        res.status(HTTPSTATUS.CREATED).send({ user });
      })
      .catch((error) => {
        if (fileName != null) {
          deleteFileFromFireBase(AVATAR_EXT + "/" + fileName);
        }
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const GetUsers = async (req: express.Request, res: express.Response) => {
  try {
    let { page = 1, take = 10, search = "", Role, isActive } = req.query;
    page = handleGetNumber(page, 1);
    take = handleGetNumber(take, 1);
    let skip = (page - 1) * take;
    const { users, count } = await getUsersWithQuery({
      skip,
      take,
      search: search as string,
      Role: Role as Role,
      isActive: createBooleanCondition(isActive as string),
    });
    res
      .status(HTTPSTATUS.OK)
      .send({ users, paginate: createPaginate(count, take, page) });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const GetUserParams = async (req: express.Request, res: express.Response) => {
  try {
    let { id } = req.params;
    if (!id || !isNumber(id))
      return res.status(HTTPSTATUS.BAD_REQUEST).send({
        name: ERRORTYPE.DATA_ERROR,
        message: "Id không hợp lệ",
      });
    const user = await UserModel.findUnique({
      where: {
        id: Number(id),
      },
      select: USER_FIELD_SELECT.COMMON,
    });
    if (!user) {
      return res.status(HTTPSTATUS.NOT_FOUND).send({ user: null });
    }
    return res.status(HTTPSTATUS.NOT_FOUND).send({ user });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const GetUserByID = async (req: express.Request, res: express.Response) => {
  try {
    let id = req.query.id || req.body.id;
    if (!id || !isNumber(id))
      return res.status(HTTPSTATUS.BAD_REQUEST).send({
        name: ERRORTYPE.DATA_ERROR,
        message: "Id không hợp lệ",
      });
    const user = await UserModel.findUnique({
      where: {
        id: Number(id),
      },
      select: USER_FIELD_SELECT.COMMON,
    });
    if (!user) {
      return res.status(HTTPSTATUS.NOT_FOUND).send({ user: null });
    }
    return res.status(HTTPSTATUS.NOT_FOUND).send({ user });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const GetUserByEmail = async (req: express.Request, res: express.Response) => {
  try {
    let email = req.query.email || req.body.email;
    const user = await UserModel.findUnique({
      where: {
        email,
      },
      select: USER_FIELD_SELECT.COMMON,
    });
    if (!user) {
      return res.status(HTTPSTATUS.NOT_FOUND).send({ user: null });
    }
    return res.status(HTTPSTATUS.NOT_FOUND).send({ user });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const ChangeUserPassword = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id, newPassword } = req.body;
    passwordSchema.parse({ password: newPassword });
    const hashPass = bcrypt.hashSync(newPassword, SALTPASS);
    const updatedUser = await UserModel.update({
      where: {
        id,
      },
      data: {
        password: hashPass,
        tokenVersion: { increment: 1 },
      },
      select: USER_FIELD_SELECT.COMMON,
    });

    return res.status(HTTPSTATUS.OK).send({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const DeleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.body;
    const requestUser = req.user;

    const deleteUser = await UserModel.findUnique({
      where: {
        id,
      },
      select: {
        Role: true,
      },
    });
    if (
      getPriorityRole(requestUser?.Role) <= getPriorityRole(deleteUser?.Role)
    ) {
      return res.status(HTTPSTATUS.FORBIDDEN).send({
        name: ERRORTYPE.FORBIDDEN,
        issues: {
          message: "Bạn không đủ quyền để thực hiện hành động này!",
        },
      });
    }

    UserModel.delete({
      where: {
        id,
      },
    })
      .then(() => {
        res.status(HTTPSTATUS.OK).send({ user: {} });
      })
      .catch(() => {
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
      });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const UpdateEmail = async (req: express.Request, res: express.Response) => {
  try {
    const { id, email } = req.body;
    const requestUser = req.user;

    const updateUser = await UserModel.findUnique({
      where: {
        id,
      },
      select: {
        Role: true,
      },
    });
    emailSchema.parse({ email });

    if (
      getPriorityRole(requestUser?.Role) <= getPriorityRole(updateUser?.Role)
    ) {
      return res.status(HTTPSTATUS.FORBIDDEN).send({
        name: ERRORTYPE.FORBIDDEN,
        issues: {
          message: "Bạn không đủ quyền để thực hiện hành động này!",
        },
      });
    }

    let user = await UserModel.update({
      where: {
        id,
      },
      data: {
        email,
      },
      select: USER_FIELD_SELECT.COMMON,
    });
    return res.status(HTTPSTATUS.OK).send({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const UpdateUserName = async (req: express.Request, res: express.Response) => {
  try {
    const { id, username } = req.body;
    const requestUser = req.user;

    const updateUser = await UserModel.findUnique({
      where: {
        id,
      },
      select: {
        Role: true,
      },
    });

    if (
      getPriorityRole(requestUser?.Role) <= getPriorityRole(updateUser?.Role)
    ) {
      return res.status(HTTPSTATUS.FORBIDDEN).send({
        name: ERRORTYPE.FORBIDDEN,
        issues: {
          message: "Bạn không đủ quyền để thực hiện hành động này!",
        },
      });
    }

    UserModel.update({
      where: {
        id,
      },
      data: {
        username,
      },
      select: USER_FIELD_SELECT.COMMON,
    }).then((user) => {
      return res.status(HTTPSTATUS.OK).send({
        user,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};
1;
export const UsersController = {
  CreateUser,
  GetUsers,
  GetUserByID,
  GetUserByEmail,
  GetUserParams,
  ChangeUserPassword,
  DeleteUser,
  UpdateEmail,
  UpdateUserName,
};
