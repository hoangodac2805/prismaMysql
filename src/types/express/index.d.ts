import {  } from "prisma";

declare global {
  namespace Express {
    export interface Request {
      user?: Prisma.UserSelect;
    }
  }
}
