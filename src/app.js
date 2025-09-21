import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import locationRoutes from "./routes/locationRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Rotas
app.use("/api/locations", locationRoutes);

export default app;
