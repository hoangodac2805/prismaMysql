import express from "express";
import { Pagination } from "../types/Common";
import { Role } from "@prisma/client";
export const validateFile = (
  file: Express.Multer.File,
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
  const arrayfiles: Express.Multer.File[] = req.files as Express.Multer.File[];
  return arrayfiles ?  Object.fromEntries(
    arrayfiles.map((file: Express.Multer.File) => [file.fieldname, file])
  ) : {}
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

export const createBooleanCondition = (
  value: string | undefined
): boolean | undefined => {
  if (value) {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return undefined;
};

export const isNumber = (input: any): boolean => {
  return (
    (typeof input === "string" || typeof input === "number") &&
    !isNaN(Number(input))
  );
};

export const getPriorityRole = (role?: Role): number => {
  switch (role) {
    case "USER":
      return 0;
    case "ADMIN":
      return 1;
    case "SUPERADMIN":
      return 2;
    default:
      return 0;
  }
};

export const generateFieldToSelect = <T>(
  fields: Array<keyof T>
): Record<keyof T, true> => {

  const selection: Record<string, true> = {};
  
  fields.forEach((field) => {
    selection[field as string] = true;
  });
  
  return selection as Record<keyof T, true>;
};

