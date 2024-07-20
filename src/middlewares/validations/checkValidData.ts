import express from "express";
import { z } from "zod";
import { UserModel } from "../../database/Users";
import { HTTPSTATUS } from "../../enums/HttpStatus";
import { ERRORTYPE } from "../../enums/ErrorType";

export const validateSchema = (schema: z.ZodSchema<any>) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
      }
      res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
    }
  };
};

export const validateEmailExist = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email } = req.body;
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
    next();
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};
