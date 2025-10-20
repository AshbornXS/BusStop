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

export const authenticateUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return { error: { status: 401, message: "Authorization header missing" } };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: { status: 401, message: "Token missing" } };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return { error: { status: 401, message: "Invalid token" } };
  }

  const user = await User.findById(decoded.userId).select('-password');
  if (!user) {
    return { error: { status: 404, message: "User not found" } };
  }

  return { user };
};
