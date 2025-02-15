import express from "express";
import userRouter from "./routes/user";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: ["http://sketchflow.codexyash.com", "https://sketchflow.codexyash.com"],
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`HTTP server is running at PORT ${PORT}`);
});
