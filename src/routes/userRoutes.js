import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { getUserProfile, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);

const adminAuth = [authMiddleware, adminMiddleware];

router.get('/', adminAuth, getAllUsers);

router.put('/:id', adminAuth, updateUser);

router.delete('/:id', adminAuth, deleteUser);

export default router;
