import { z } from "zod";

export const JWT_SECRET = "123123";

export const CreateUserSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid Email",
  }),
  password: z.string().min(6, {
    message:
      "Password length should be greater than 6 and should be alphanumeric",
  }),
  name: z.string(),
});

export const SignInUserSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid Email",
  }),
  password: z.string().min(6, {
    message:
      "Password length should be greater than 6 and should be alphanumeric",
  }),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(3, {
    message: "Title length should be greater than or equal to 3",
  }),
});
