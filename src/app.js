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

// Configuração explícita do CORS para permitir DELETE e Headers de Auth
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Rota teste
app.get("/", (req, res) => {
  res.send("🚍 BusStop API rodando!");
});

// Rotas
app.use("/locations", locationRoutes);

// Auth
app.use("/auth", authRoutes);

// User
app.use("/user", userRoutes);

// Files
app.use("/files", fileRoutes);

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
