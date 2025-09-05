const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de acesso requerido' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          error: 'Token inválido - usuário não encontrado' 
        });
      }

      req.user = user;
      req.userId = user._id;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

module.exports = authMiddleware;