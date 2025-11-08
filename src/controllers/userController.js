import User from "../models/User.js";
import dotenv from "dotenv";
import authMiddleware from "../middlewares/authMiddleware.js";

dotenv.config();

export const getUserProfile = async (req, res) => {
  try {
    const { user, error } = await authMiddleware.authenticateUser(req, res);
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
    const { user, error } = await authMiddleware.authenticateUser(req, res);
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
    const { user, error } = await authMiddleware.authenticateUser(req, res);
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
    const { user, error } = await authMiddleware.authenticateUser(req, res);
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
};

export const updateUser = async (req, res) => {
  const { name, cpf, saldo } = req.body;
  const userId = req.params.id;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (cpf) fieldsToUpdate.cpf = cpf;
  if (saldo !== undefined) fieldsToUpdate.saldo = saldo;

  try {
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $set: fieldsToUpdate },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário removido' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};
