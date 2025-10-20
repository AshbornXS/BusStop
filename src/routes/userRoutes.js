import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { getUserProfile, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// Rota para o próprio usuário ver seu perfil
router.get('/profile', authMiddleware, getUserProfile);

// --- Rotas de Administrador ---
const adminAuth = [authMiddleware, adminMiddleware];

// Admin: Listar todos os usuários
router.get('/', adminAuth, getAllUsers);

// Admin: Atualizar um usuário específico
router.put('/:id', adminAuth, updateUser);

// Admin: Deletar um usuário específico
router.delete('/:id', adminAuth, deleteUser);

export default router;
