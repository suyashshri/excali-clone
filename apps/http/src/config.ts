declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const JWT_SECRET = "123123";
