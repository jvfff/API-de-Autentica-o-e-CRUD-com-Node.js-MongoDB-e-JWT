const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'Dados do usuário obtidos com sucesso',
      user: req.user
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;