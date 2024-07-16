import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { HTTPSTATUS } from "../enums/HttpStatus";
import { ERRORTYPE } from "../enums/ErrorType";
import { JWTSALT, SALTPASS } from "../config";
import { UserModel } from "../database/Users";
import { loginSchema, userCreateSchema } from "../libs/zodSchemas/usersSchema";

const Register = async (req: express.Request, res: express.Response) => {
  const { username, firstName, lastName, email, password } = req.body;
  try {
    userCreateSchema.parse({ username, email, password, firstName, lastName });
    const checkEmailUsed = await UserModel.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (checkEmailUsed) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send({
        name: ERRORTYPE.DATA_ERROR,
        message: "Email đã được sử dụng, vui lòng chọn email khác!",
      });
    }
    const hashPass = bcrypt.hashSync(password, SALTPASS);
    const user = await UserModel.create({
      data: { username, lastName, firstName, email, password: hashPass },
      select: {
        email: true,
        lastName: true,
        firstName: true,
        username: true,
      },
    });
    res.status(HTTPSTATUS.CREATED).send({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

const Login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;
  try {
    loginSchema.parse({ email, password });

    let user = await UserModel.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(HTTPSTATUS.NOT_FOUND).send({
        name: ERRORTYPE.DATA_ERROR,
        message: "Tài khoản không tồn tại",
      });
    }

    if (!user.isActive) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send({
        name: ERRORTYPE.DATA_ERROR,
        message:
          "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email kích hoạt khoản",
      });
    }

    let checkPasword = bcrypt.compareSync(password, user.password);

    if (!checkPasword) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send({
        name: ERRORTYPE.DATA_ERROR,
        message: "Email hoặc mật khẩu không chính xác, vui lòng thử lại",
      });
    }

    const token = jwt.sign(
      { email: user.email, type: user.Role, tokenVersion: user.tokenVersion },
      JWTSALT,
      {
        expiresIn: 60 * 60 * 24 * 30,
      }
    );

    let {
      createdAt,
      updatedAt,
      tokenVersion,
      password: _,
      ...returnUser
    } = user;

    res.status(HTTPSTATUS.OK).send({
      user: returnUser,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

export const AuthenticationController = {
  Register,
  Login,
};
