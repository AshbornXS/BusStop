import mongoose from "mongoose";

const generateRandomUserId = () => {
  return Math.floor(10000 + Math.random() * 90000);
};

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true,
    default: generateRandomUserId
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  CEP: {
    type: String
  },
  street: {
    type: String
  },
  number: {
    type: String
  },
  complement: {
    type: String
  },
  neighborhood: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  CPF: {
    type: String
  },
  phone: {
    type: String
  },
  saldo: {
    type: Number,
    default: 0
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

export default mongoose.model("User", userSchema);
