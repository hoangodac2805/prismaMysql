import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserModel } from "../database/Users";
import { Role } from "@prisma/client";
import {
  createBooleanCondition,
  createPaginate,
  handleGetNumber,
} from "../utils";
import { AVATAR_EXT, SALTPASS, USER_FIELD_SELECT } from "../config";
import { HTTPSTATUS } from "../enums/HttpStatus";
import { deleteFileFromFireBase } from "../services/firebase";
import { emailSchema, passwordSchema } from "../libs/zodSchemas/usersSchema";
import { getUsersWithQuery } from "../services/userService";
import { AvatarModel } from "../database/Avatars";

const CreateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { userName, firstName, lastName, email, password, role, avatar } =
      req.body;

    const hashPass = bcrypt.hashSync(password, SALTPASS);

    const userAvatar = await AvatarModel.create({
      data: { url: avatar.downloadURL },
    });

    UserModel.create({
      data: {
        userName,
        lastName,
        firstName,
        email,
        role,
        password: hashPass,
        avatar: {
          connect: { id: userAvatar.id },
        },
        usedAvatars: {
          connect: [{ id: userAvatar.id }],
        },
      },
      select: USER_FIELD_SELECT.COMMON,
    })
      .then((user) => {
        res.status(HTTPSTATUS.CREATED).send({ user });
      })
      .catch((error) => {
        if (avatar.fileName != null) {
          deleteFileFromFireBase(AVATAR_EXT + "/" + avatar.fileName);
          AvatarModel.delete({
            where: {
              id: userAvatar.id,
            },
          });
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
    let { page = 1, take = 10, search = "", role, isActive } = req.query;
    page = handleGetNumber(page, 1);
    take = handleGetNumber(take, 1);
    let skip = (page - 1) * take;
    const { users, count } = await getUsersWithQuery({
      skip,
      take,
      search: search as string,
      role: role as Role,
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
    const user = await UserModel.findUnique({
      where: {
        id: Number(id),
      },
      select: USER_FIELD_SELECT.COMMON,
    });
    return res.status(HTTPSTATUS.NOT_FOUND).send({ user });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const GetUserByID = async (req: express.Request, res: express.Response) => {
  try {
    let id = req.query.id || req.body.id;
    const user = await UserModel.findUnique({
      where: {
        id: Number(id),
      },
      select: USER_FIELD_SELECT.COMMON,
    });

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

    UserModel.delete({
      where: {
        id: Number(id),
      },
    })
      .then(() => {
        res.status(HTTPSTATUS.OK).send({ user: {} });
      })
      .catch((error) => {
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
      });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const UpdateEmail = async (req: express.Request, res: express.Response) => {
  try {
    const { id, email } = req.body;

    emailSchema.parse({ email });

    let user = await UserModel.update({
      where: {
        id: Number(id),
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
    const { id, userName } = req.body;

    UserModel.update({
      where: {
        id: Number(id),
      },
      data: {
        userName,
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

const UpdateFirstName = async (req: express.Request, res: express.Response) => {
  try {
    const { id, firstName } = req.body;

    UserModel.update({
      where: {
        id: Number(id),
      },
      data: {
        firstName,
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

const UpdateLastName = async (req: express.Request, res: express.Response) => {
  try {
    const { id, lastName } = req.body;

    UserModel.update({
      where: {
        id: Number(id),
      },
      data: {
        lastName,
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

const ActiveUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.body;

    UserModel.update({
      where: {
        id: Number(id),
      },
      data: {
        isActive: true,
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

const InactiveUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.body;

    UserModel.update({
      where: {
        id: Number(id),
      },
      data: {
        isActive: false,
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

const UpdateAvatar = async (req: express.Request, res: express.Response) => {
  try {
    const { id, avatar } = req.body;

    const newAvatar = await AvatarModel.create({
      data: {
        url: avatar.downloadURL,
      },
    });
    console.log(`newAvatar`, newAvatar);
    const user = await UserModel.update({
      where: { id: Number(id) },
      data: {
        avatar: { connect: { id: newAvatar.id } },
        usedAvatars: { connect: [{ id: newAvatar.id }] },
      },
      select: USER_FIELD_SELECT.COMMON,
    });

    return res.status(HTTPSTATUS.OK).send({
      user,
    });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const UpdateAvatarByUsed = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id, avatarId } = req.body;

    const user = await UserModel.update({
      where: {
        id: Number(id),
      },
      data: {
        avatar: {
          connect: {
            id: Number(avatarId),
          },
        },
      },
      select: USER_FIELD_SELECT.COMMON,
    });
    return res.status(HTTPSTATUS.OK).send({
      user,
    });
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

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
  UpdateFirstName,
  UpdateLastName,
  ActiveUser,
  InactiveUser,
  UpdateAvatar,
  UpdateAvatarByUsed,
};
