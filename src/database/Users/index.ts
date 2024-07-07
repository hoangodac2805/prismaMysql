// import { UserCreateType } from "../../types/UserType";
import prisma from "../prisma";
import { User } from "@prisma/client";

// const CreateUser = async (data: User) =>
//   await prisma.user.create({ data });

export const UserModel = prisma.user;