import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import locationRoutes from "./routes/locationRoutes.js";
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

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
