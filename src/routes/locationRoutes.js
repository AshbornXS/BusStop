import { Router } from "express";
import { saveLocation, getLastLocation } from "../controllers/locationController.js";

const router = Router();

router.post("/", saveLocation);          // Receber localização
router.get("/:busId", getLastLocation);  // Buscar última posição

export default router;
