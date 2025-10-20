import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Função para gerar uma string de 5 números aleatórios
function generateId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Middleware para gerar o ID automaticamente antes da validação
export function userIdMiddleware(schema) {
  schema.pre("validate", function (next) {
    if (!this.id) {
      this.id = generateId();
    }
    next();
  });
}

const authMiddleware = (req, res, next) => {
  // Pega o token do header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Verifica se não há token
  if (!token) {
    return res
      .status(401)
      .json({ message: "Nenhum token, autorização negada" });
  }

  // Verifica o token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token não é válido" });
  }
};

export default authMiddleware;
