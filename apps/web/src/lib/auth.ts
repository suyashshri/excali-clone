import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function getUserIdFromToken(): string | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }
    try {
      const parsedtoken = token.split(" ")[1];

      const payload = jwt.verify(parsedtoken, "123123") as JwtPayload;

      if (!payload || typeof payload !== "object") {
        throw new Error("Invalid token payload");
      }

      if (payload && payload.userId) {
        return payload.userId;
      }
    } catch (error) {
      return null;
    }
  }
  return null;
}
