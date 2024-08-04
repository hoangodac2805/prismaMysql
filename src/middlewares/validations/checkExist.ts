import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { HTTPSTATUS } from "../../enums/HttpStatus";
import { ERRORTYPE } from "../../enums/ErrorType";
import { isNumber } from "../../utils";

type ModelType = PrismaClient[keyof PrismaClient];

export const checkExist = (model: ModelType, key: string = "id") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let item;
    let keyValue = req.params[key] || req.query[key] || req.body[key] ;
      
    if (keyValue) {
      if (key === "id") {
        keyValue = Number(keyValue);
        if (!isNumber(keyValue)) {
          return res.status(HTTPSTATUS.BAD_REQUEST).send({
            name: ERRORTYPE.DATA_ERROR,
            message: "Id không hợp lệ",
          });
        }
      }
      const condition = { where: { [key]: keyValue } };
      item = await (model as any).findUnique(condition);

      if (item) {
        return next();
      }
    }

    return res.status(HTTPSTATUS.NOT_FOUND).send({
      name: ERRORTYPE.DATA_ERROR,
      message: "Không tìm thấy dữ liệu trùng với " + key,
    });
  };
};
