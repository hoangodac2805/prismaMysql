import express from "express"
import jwt from "jsonwebtoken";
import { JWTSALT } from "../../config";
import { HTTPSTATUS } from "../../enums/HttpStatus";
import { ERRORTYPE } from "../../enums/ErrorType";
import { UserModel } from "../../database/Users";
import { ITokenPayload } from "../../types/Jwt";


export const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(HTTPSTATUS.UNAUTHORIZED).send({
                name: ERRORTYPE.UNAUTHORIZED_ERROR,
                issues: { message: "Vui lòng đăng nhập" }
            });
        }

        const token = authHeader.replace("Bearer ","");

        const decode = jwt.verify(token, JWTSALT) as ITokenPayload;
        const user = await UserModel.findUnique({
            where: {
                email: decode.email,
            }
        })

        if (!user || user.tokenVersion !== decode.tokenVersion) {
            return res.status(HTTPSTATUS.UNAUTHORIZED).send({
                name: ERRORTYPE.UNAUTHORIZED_ERROR,
                issues: { message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" }
            });
        }

        req.user = user

        next();
    } catch (error) {
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error)
    }

}
