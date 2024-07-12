import express from "express";
import { IFileObject } from "../types/File";
import { Pagination } from "../types/Common";
import { Prisma, User } from "@prisma/client";
import { string } from "zod";
export const validateFile = (
    file: IFileObject,
    ext: string[],
    size: number = 1000000
) => {
    let notifi = {
        status: true,
        message: "",
    };
    if (!ext.includes(file.mimetype)) {
        notifi.status = false;
        notifi.message = "File format must be " + ext.concat("");
    }
    if (size < file.size) {
        notifi.status = false;
        notifi.message = "File size must be small than " + size + " bytes";
    }
    return notifi;
};

export const convertArrayFileToObject = (req: express.Request) => {
    const arrayfiles: IFileObject[] = req.files as IFileObject[];
    return Object.fromEntries(
        arrayfiles.map((file: IFileObject) => [file.fieldname, file])
    );
};

export const handleGetNumber = (
    value: any,
    minValue: number,
    fallbackValue: number = 1
) => {
    if (typeof value !== "number") {
        value = parseInt(value.toString());
        if (isNaN(value)) {
            value = fallbackValue;
        }
    }
    return Math.max(value, minValue);
};

export const createPaginate = (
    totalRecord: number,
    limit: number,
    page: number
): Pagination => {
    let totalPage = Math.ceil(totalRecord / limit);
    return {
        totalRecord,
        totalPage,
        limit,
        page,
        nextPage: page + 1 > totalPage ? null : page + 1,
        prevPage: page - 1 <= 0 ? null : page - 1,
    };
};

export const generateCondition = <T>(listKey: Array<keyof T>, qF: string = "all", qS: string = "") => {
    let condition: Record<string, string | any> = {};
    if (qS != "") {
        if (qF === "all") {
            condition = {
                OR: listKey.map((key) => {
                    return { [key]: { contains: qS as string } }
                })
            }
        }
        else {
            condition = {
                [qF.toString()]: { contains: qS as string }
            }
        }
    }
    return condition;
};

type Operation<T> = {
    contains: string | undefined,
    endsWith: string | undefined,
    equals: string | undefined,
    qt:string | undefined,
    qte:string | undefined,
    in : string[],
    lt: string | undefined,
    lte:string | undefined,
    not : string | undefined,
    notIn : string[],
    startsWith : string | undefined
}