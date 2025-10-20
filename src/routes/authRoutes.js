import { Router } from "express";
import { login, register } from "../controllers/authController.js";

const router = Router();

router.post("/register", register); // Registrar novo usuário
router.post("/login", login);       // Login de usuário

export default router;
