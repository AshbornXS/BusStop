import { Router } from "express";
import { login, register, createAdmin } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

router.post("/register", register); // Registrar novo usuário
router.post("/login", login);       // Login de usuário
router.post("/create-admin", [authMiddleware, adminMiddleware], createAdmin); // Rota para um admin criar outro admin

export default router;
