import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { HTTPSTATUS } from "../../enums/HttpStatus";
import { ERRORTYPE } from "../../enums/ErrorType";

type ModelType = PrismaClient[keyof PrismaClient];

export const checkExist = (model: ModelType, key: string = "id") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let item;
    let keyValue = req.params[key] ? req.params[key] : req.body[key];

    if (keyValue) {
      if (key === "id") {
        keyValue = Number(keyValue);
      }
      const condition = { where: { [key]: keyValue } };
      item = await (model as any).findUnique(condition);

      if (item) {
        return next();
      }
    }

    return res
      .status(HTTPSTATUS.NOT_FOUND)
      .send({ name: ERRORTYPE.DATA_ERROR, message: key + " không tồn tại" });
  };
};
