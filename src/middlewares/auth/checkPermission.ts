import express from "express";
import { UserModel } from "../../database/Users";
import { HTTPSTATUS } from "../../enums/HttpStatus";
import { getPriorityRole } from "../../utils";
import { ERRORTYPE } from "../../enums/ErrorType";

export const checkPermission = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.body;
    const requestUser = req.user;
    if (requestUser?.role === "SUPERADMIN") {
      return next();
    }
    const updateUser = await UserModel.findUnique({
      where: { id:Number(id) },
      select: {
        role: true,
      },
    });

    if (
      getPriorityRole(requestUser?.role) <= getPriorityRole(updateUser?.role)
    ) {
      return res.status(HTTPSTATUS.FORBIDDEN).send({
        name: ERRORTYPE.FORBIDDEN,
        issues: {
          message: "Bạn không đủ quyền để thực hiện hành động này!",
        },
      });
    }
    return next();
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
  }
};
