import { Role } from "@prisma/client";
import { HTTPSTATUS } from "../../enums/HttpStatus";
import express from "express";

export const authorize = (whiteList: Role[] = []) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { user } = req;
        if (whiteList.includes(user?.Role as Role)) {
            return next();
        }
        return res.status(HTTPSTATUS.FORBIDDEN).send({ message: "Permission Denied" })
    }
}
