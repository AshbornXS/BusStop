import User from "../models/User.js";
import dotenv from "dotenv";
import { authenticateUser } from "../middlewares/authMiddleware.js";

dotenv.config();

export const getUserProfile = async (req, res) => {
  try {
    const { user, error } = await authenticateUser(req, res);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { user, error } = await authenticateUser(req, res);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const allowedFields = [
      "name", "email", "CEP", "street", "number", "complement",
      "neighborhood", "city", "state", "CPF", "phone", "saldo"
    ];

    const updates = Object.keys(req.body).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addBalance = async (req, res) => {
  try {
    const { user, error } = await authenticateUser(req, res);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { amount } = req.body;
    if (typeof amount !== 'number') {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    user.saldo += amount;
    await user.save();

    res.status(200).json({ saldo: user.saldo });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const isUserExpired = async (req, res) => {
  try {
    const { user, error } = await authenticateUser(req, res);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    const isExpired = user.createdAt <= oneYearAgo;

    user.isExpired = isExpired;
    await user.save();

    res.status(200).json({ expired: isExpired });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
