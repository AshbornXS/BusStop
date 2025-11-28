import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addBalance,
  isUserExpired,
  getAllUsers,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.post('/balance', authMiddleware, addBalance);
router.get('/expired', authMiddleware, isUserExpired);

router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.put('/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
