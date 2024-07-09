import { z } from "zod";

export const userCreateSchema = z.object({
  username: z.string().min(1, "Hãy nhập username"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Tài khoản ít nhất 8 kí tự"),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Tài khoản ít nhất 8 kí tự"),
});
