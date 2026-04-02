import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- ROUTES ---
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// --- ERROR HANDLING ---
app.use(errorMiddleware);

/**
 * RENDER DEPLOYMENT FIXES:
 * 1. PORT: Render assigns a random port. We MUST use process.env.PORT.
 * 2. HOST: Render needs '0.0.0.0' to "see" your app through their firewall.
 */
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

app.listen(Number(PORT), HOST, () => {
  console.log(`
  -----------------------------------------
  🚀 Server is running!
  Mode: ${process.env.NODE_ENV || 'development'}
  Local: http://localhost:${PORT}
  Render: http://${HOST}:${PORT}
  -----------------------------------------
  `);
});
