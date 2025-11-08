import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function generateId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export function userIdMiddleware(schema) {
  schema.pre("validate", function (next) {
    if (!this.id) {
      this.id = generateId();
    }
    next();
  });
}

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Nenhum token, autorização negada" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token não é válido" });
  }
};

export default authMiddleware;
