import { Router } from "express";
import { getUserProfile, updateUserProfile, addBalance, isUserExpired } from "../controllers/userController.js";

const router = Router();

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.post("/balance", addBalance);
router.get("/is-expired", isUserExpired);

export default router;
