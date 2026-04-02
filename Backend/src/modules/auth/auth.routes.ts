import { Router } from "express";
import * as controller from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { me } from "./auth.controller.js";

const router = Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/me", authMiddleware, me);
export default router;
