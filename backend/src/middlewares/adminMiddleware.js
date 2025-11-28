import mongoose from 'mongoose';
const User = mongoose.model('User');

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: 'Falha na autenticação antes da verificação de admin.' });
    }

    const user = await User.findOne({ id: req.user.id });

    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
    }
  } catch (error) {
    console.error('Erro no adminMiddleware:', error);
    res.status(500).json({ message: 'Erro no servidor ao verificar permissões.' });
  }
};

export default adminMiddleware;
