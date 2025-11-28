import File from '../models/File.js';
import mongoose from 'mongoose';
import { Readable } from 'stream';

let gfs;
mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const { originalname, mimetype, buffer } = req.file;

    const filename = `file-${Date.now()}-${originalname}`;

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = gfs.openUploadStream(filename, {
      contentType: mimetype,
      metadata: { originalName: originalname, uploadedBy: req.user.id }
    });

    readableStream.pipe(uploadStream);

    uploadStream.on('finish', async () => {
      const newFile = new File({
        originalName: originalname,
        path: filename,
        mimetype: mimetype,
        size: buffer.length,
        uploadedBy: req.user.id
      });

      await newFile.save();

      res.status(201).json({
        message: 'Arquivo enviado com sucesso para o MongoDB!',
        file: newFile
      });
    });

    uploadStream.on('error', (error) => {
      console.error("Erro no stream de upload do GridFS:", error);
      res.status(500).json({ message: 'Erro ao salvar o arquivo no GridFS.' });
    });

  } catch (error) {
    console.error("Erro na função uploadFile:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().populate('uploadedBy', 'name email');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar arquivos.', error: error.message });
  }
};

export const getFilesByUserId = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id });

    if (!files || files.length === 0) {
      return res.json([]);
    }

    const streamToBase64 = (stream) => {
      return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      });
    };

    const filesWithDataPromises = files.map(async (file) => {
      try {
        const readStream = gfs.openDownloadStreamByName(file.path);
        const base64Data = await streamToBase64(readStream);

        return {
          _id: file._id,
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          createdAt: file.createdAt,
          fileData: `data:${file.mimetype};base64,${base64Data}`
        };
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.warn(`Arquivo órfão encontrado e ignorado: ${file.path}`);
          return null;
        }
        throw error;
      }
    });

    const filesWithData = (await Promise.all(filesWithDataPromises)).filter(f => f !== null);

    res.json(filesWithData);

  } catch (error) {
    console.error("Erro ao buscar arquivos do usuário com dados:", error);
    res.status(500).json({ message: 'Erro ao processar os arquivos do usuário.' });
  }
};

export const deleteFilesByUserId = async (userId) => {
  try {
    await File.deleteMany({ uploadedBy: userId });
  } catch (error) {
    console.error(`Erro ao deletar arquivos do usuário ${userId}:`, error);
  }
};
