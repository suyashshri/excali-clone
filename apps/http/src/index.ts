import express from "express";
import userRouter from "./routes/user";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "https://sketchflow.codexyash.com", // Allow requests from your domain
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`HTTP server is running at PORT ${PORT}`);
});
