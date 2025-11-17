import { Router } from "express";
import { saveLocation, getLastLocation, getAllLocations, saveLastLocation } from "../controllers/locationController.js";

const router = Router();

router.post("/", saveLocation);
router.post("/last", saveLastLocation);
router.get("/:busId", getLastLocation);
router.get("/all/:busId", getAllLocations);

export default router;
