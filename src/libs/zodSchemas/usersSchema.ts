import { z } from "zod";
import { Role } from "@prisma/client";
import { ErrorMes } from "./errorMessage";


export const userCreateSchema = z.object({
  username: z.string({ required_error: ErrorMes.required, invalid_type_error: ErrorMes.invalidType }).min(1, ErrorMes.required),
  firstName: z.string({ invalid_type_error: ErrorMes.invalidType }).optional(),
  lastName: z.string({ invalid_type_error: ErrorMes.invalidType }).optional(),
  email: z.string({ required_error: ErrorMes.required, invalid_type_error: ErrorMes.invalidType }).email(ErrorMes.invalidType),
  password: z.string({ required_error: ErrorMes.required, invalid_type_error: ErrorMes.invalidType }).min(8, ErrorMes.minCharacter(8)),
  Role: z.enum([Role.ADMIN, Role.USER], { message: ErrorMes.invalidType }).optional()
});

export const loginSchema = z.object({
  email: z.string({ required_error: ErrorMes.required, invalid_type_error: ErrorMes.invalidType }).email(ErrorMes.invalidType),
  password: z.string({ required_error: ErrorMes.required, invalid_type_error: ErrorMes.invalidType }).min(8, ErrorMes.minCharacter(8)),
});
