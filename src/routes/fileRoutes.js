import { Router } from 'express';
import { uploadFile, getAllFiles } from '../controllers/fileController.js';import upload from '../middlewares/fileMiddleware.js';
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

// Rota para upload de um único arquivo
router.post('/upload', authMiddleware, upload.single('document'), uploadFile);

// Rota para admin listar todos os arquivos
router.get('/', [authMiddleware, adminMiddleware], getAllFiles);

export default router;
