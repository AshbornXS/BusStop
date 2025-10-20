import File from '../models/File.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const { originalname, path, mimetype, size } = req.file;

    const newFile = new File({
      originalName: originalname,
      path: path,
      mimetype: mimetype,
      size: size,
      // Se o upload for atrelado a um usuário logado:
      // uploadedBy: req.user.id
    });

    await newFile.save();

    res.status(201).json({
      message: 'Arquivo enviado com sucesso!',
      file: newFile
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar o arquivo.', error: error.message });
  }
};

// Função para listar todos os arquivos
export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().populate('uploadedBy', 'name email');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar arquivos.', error: error.message });
  }
};
