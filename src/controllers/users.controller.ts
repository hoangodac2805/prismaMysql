import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { HTTPSTATUS } from "../enums/HttpStatus";
import { SALTPASS } from "../config";
import { UserModel } from "../database/Users";
import { userCreateSchema } from "../libs/zodSchemas/usersSchema";
const CreateUser = async (req: express.Request, res: express.Response) => {
  const { username, firstName, lastName, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res
        .status(HTTPSTATUS.BAD_REQUEST)
        .send("Missing required fields: username, email, or password");
    }

    userCreateSchema.parse({ username, email, password, firstName, lastName });

    const existingUser = await UserModel.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(HTTPSTATUS.CONFLICT).send("Email already in use");
    }

    const hashPass = bcrypt.hashSync(password, SALTPASS);
    const newUser = await UserModel.create({
      data: { username, lastName, firstName, email, password: hashPass },
    });

    res.status(HTTPSTATUS.CREATED).send(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTPSTATUS.BAD_REQUEST).send(error.errors);
    }
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};

export const UsersController = {
  CreateUser
};
