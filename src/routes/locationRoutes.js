import { Router } from "express";
import { saveLocation, getLastLocation, getAllLocations } from "../controllers/locationController.js";

const router = Router();

router.post("/", saveLocation);          // Receber localização
router.get("/:busId", getLastLocation);  // Buscar última posição
router.get("/all/:busId", getAllLocations); // Buscar todas as posições
router.get("/align/:busId", getAlignedLocations); // Rota alternativa para compatibilidade

export default router;
