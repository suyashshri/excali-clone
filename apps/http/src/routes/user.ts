import express, { Router } from "express";
import { CreateUserSchema, SignInUserSchema } from "@repo/backend-common/types";
import bcrypt from "bcrypt";
import { db } from "@repo/db/client";
import jwt from "jsonwebtoken";
import roomRouter from "./room";
import { JWT_SECRET } from "../config";

const router: Router = express.Router();

router.use("/room", roomRouter);

router.post("/signup", async (req, res) => {
  const data = req.body;
  const parsedData = CreateUserSchema.safeParse(data);

  if (!parsedData.success) {
    res
      .json({
        message: "Please pass the correct inputs",
      })
      .status(422);
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    const user = await db.user.create({
      data: {
        email: parsedData.data.email,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });
    res.json({ userId: user.id }).status(200);
  } catch (error) {
    console.log("Sign Up Error: ", error);
    res.json({
      message: "Unable to create the user",
    });
  }
});

router.post("/signin", async (req, res) => {
  const data = req.body;
  const parsedData = SignInUserSchema.safeParse(data);

  if (!parsedData.success) {
    res
      .json({
        message: "Unable to sign in the user",
      })
      .status(402);
    return;
  }
  try {
    const user = await db.user.findFirst({
      where: {
        email: parsedData.data.email,
      },
    });
    if (!user) {
      res
        .json({
          message: "Please Sign Up before logging in",
        })
        .status(404);
    }
    const isPasswordMatching = await bcrypt.compare(
      parsedData.data.password,
      user?.password!
    );
    if (!isPasswordMatching) {
      res.json({ message: "Incorrect Password" }).status(401);
    }
    const token = jwt.sign(
      {
        userId: user?.id,
      },
      JWT_SECRET
    );
    res.json({
      token,
    });
  } catch (error) {
    console.log("SignIn error : ", error);
    res.json({
      message: "Unable to Sign in the user",
    });
  }
});

export default router;
