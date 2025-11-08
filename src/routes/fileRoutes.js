import { Router } from 'express';
import { uploadFile, getAllFiles, getFilesByUserId, deleteFilesByUserId } from '../controllers/fileController.js';
import upload from '../middlewares/fileMiddleware.js';
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

router.post('/upload', authMiddleware, upload.single('document'), uploadFile);

router.get('/', [authMiddleware, adminMiddleware], getAllFiles);

router.get('/:id', [authMiddleware, adminMiddleware], getFilesByUserId);

router.delete('/:id', [authMiddleware, adminMiddleware], deleteFilesByUserId);

export default router;
