import { Role } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

export interface ITokenPayload extends JwtPayload {
    email: string,
    token: Role,
    tokenVersion : number
}