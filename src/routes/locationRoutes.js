import { Router } from "express";
import { saveLocation, getLastLocation, getAllLocations } from "../controllers/locationController.js";

const router = Router();

router.post("/", saveLocation);
router.get("/:busId", getLastLocation);
router.get("/all/:busId", getAllLocations);

export default router;
