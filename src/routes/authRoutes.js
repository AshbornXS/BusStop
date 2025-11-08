import { Router } from "express";
import { login, register, createAdmin } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/create-admin", [authMiddleware, adminMiddleware], createAdmin);

export default router;
