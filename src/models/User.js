import mongoose from "mongoose";
import { userIdMiddleware } from "../middlewares/authMiddleware.js";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  CEP: { type: String },
  street: { type: String },
  number: { type: String },
  complement: { type: String },
  neighborhood: { type: String },
  city: { type: String },
  state: { type: String },
  CPF: { type: String },
  phone: { type: String },
  saldo: { type: Number, default: 0 },
  isExpired: { type: Boolean, default: false }
});

userIdMiddleware(userSchema);

export default mongoose.model("User", userSchema);
