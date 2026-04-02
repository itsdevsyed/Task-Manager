import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes.js";
import taskRoutes from "./modules/task/task.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
