import { z } from "zod";
import { Role } from "@prisma/client";
import { ErrorMes } from "./errorMessage";

const stringField = (required = false, minLength = 0) => {
  const base = z.string({ invalid_type_error: ErrorMes.invalidType });
  if (required) {
    return base.min(minLength, ErrorMes.required);
  }
  return base.min(minLength).optional();
};

const emailField = z
  .string({
    required_error: ErrorMes.required,
    invalid_type_error: ErrorMes.invalidType,
  })
  .email(ErrorMes.invalidType);

const passwordField = z
  .string({
    required_error: ErrorMes.required,
    invalid_type_error: ErrorMes.invalidType,
  })
  .min(8, ErrorMes.minCharacter(8));

const roleField = z
  .enum([Role.ADMIN, Role.USER], { message: ErrorMes.invalidType })
  .optional();

export const userCreateSchema = z.object({
  username: stringField(true, 1),
  firstName: stringField(),
  lastName: stringField(),
  email: emailField,
  password: passwordField,
  role: roleField,
});

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const passwordSchema = z.object({
  password: passwordField,
});

export const emailSchema = z.object({
  email: emailField,
});
