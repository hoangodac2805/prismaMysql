import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserModel } from "../database/Users";
import {
    convertArrayFileToObject,
    createPaginate,
    generateCondition,
    handleGetNumber,
    validateFile,
} from "../utils";
import { AVATAR_EXT, STORAGE_DIR, SALTPASS } from "../config";
import { HTTPSTATUS } from "../enums/HttpStatus";
import { ERRORTYPE } from "../enums/ErrorType";
import { deleteFileFromFireBase, uploadToFireBase } from "../services/firebase";
import { userCreateSchema } from "../libs/zodSchemas/usersSchema";
import { User } from "@prisma/client";

const CreateUser = async (req: express.Request, res: express.Response) => {
    try {
        const { username, firstName, lastName, email, password, Role } = req.body;
        const files = convertArrayFileToObject(req);

        let { avatar } = files;

        userCreateSchema.parse({
            username,
            email,
            password,
            firstName,
            lastName,
            Role,
        });

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
                issues: { message: "Email đã được sử dụng, vui lòng chọn email khác!" },
            });
        }

        if (avatar) {
            let validateFileProcess = validateFile(avatar, AVATAR_EXT);
            if (!validateFileProcess.status) {
                return res.status(HTTPSTATUS.BAD_REQUEST).send({
                    name: ERRORTYPE.DATA_ERROR,
                    issues: {
                        message: validateFileProcess.message,
                    },
                });
            }
        }

        let { fileName, downloadURL: avatarURL } = avatar
            ? (await uploadToFireBase(avatar, STORAGE_DIR.USER_AVATAR)).data
            : { fileName: null, downloadURL: null };

        const hashPass = bcrypt.hashSync(password, SALTPASS);

        UserModel.create({
            data: {
                username,
                lastName,
                firstName,
                email,
                Role,
                password: hashPass,
                avatar: avatarURL,
            },
            select: {
                email: true,
                lastName: true,
                firstName: true,
                username: true,
                avatar: true,
                Role: true,
            },
        })
            .then((user) => {
                res.status(HTTPSTATUS.CREATED).send({ user });
            })
            .catch((error) => {
                if (fileName != null) {
                    deleteFileFromFireBase(AVATAR_EXT + "/" + fileName);
                }
                res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
            });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(HTTPSTATUS.BAD_REQUEST).send(error);
        }
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
    }
};

const GetUsers = async (req: express.Request, res: express.Response) => {
    try {
        let { page = 1, limit = 10, qF = "all", qS = "" } = req.query;
        page = handleGetNumber(page, 1);
        limit = handleGetNumber(limit, 1);
        let offset = (page - 1) * limit;
        // let condition: Record<string, string | any> = {};
        // if (qS != "") {
        //   if (qF === "all") {
        //     condition = {
        //       OR: [
        //         { username: { contains: qS as string } },
        //         { email: { contains: qS as string } },
        //         { lastName: { contains: qS as string } },
        //         { firstName: { contains: qS as string } },
        //       ],
        //     };
        //   } else {
        //     condition = {
        //       [qF.toString()]: { contains: qS as string },
        //     };
        //   }
        // }
        let condition = generateCondition<User>(["username", "email", "lastName", "firstName"], qF as string, qS as string);

        console.log(condition);
        

        const users = await UserModel.findMany({
            skip: offset,
            take: limit,
            where: {
                username:{
                    
                }
            },
            select: {
                id: true,
                email: true,
                lastName: true,
                firstName: true,
                username: true,
                avatar: true,
                Role: true,
                isActive: true,
                tokenVersion: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const totalUsers = await UserModel.count();
        res
            .status(HTTPSTATUS.OK)
            .send({ users, paginate: createPaginate(totalUsers, limit, page) });
    } catch (error) {
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).send(error);
    }
};

export const UsersController = {
    CreateUser,
    GetUsers,
};
