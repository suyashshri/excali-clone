import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.json({ message: "Unauthorized" }).status(401);
    return;
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded) {
    req.userId = (decoded as JwtPayload).userId;

    next();
  } else {
    res.json({ message: "Unauthorized" }).status(401);
    return;
  }
}
