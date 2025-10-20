import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import locationRoutes from "./routes/locationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Rota teste
app.get("/", (req, res) => {
  res.send("🚍 BuStop API rodando!");
});

// Rotas
app.use("/api/locations", locationRoutes);

// Auth
app.use("/api/auth", authRoutes);

// User
app.use("/api/user", userRoutes);

// Files
app.use("/api/file", fileRoutes);

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
