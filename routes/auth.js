const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  validateRegister, 
  validateLogin, 
  validateRefreshToken 
} = require('../middleware/validation');

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId }, 
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId }, 
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email já está em uso' 
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Email já está em uso' 
      });
    }

    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      message: 'Login realizado com sucesso',
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

router.post('/refresh', validateRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        error: 'Refresh token inválido ou expirado' 
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.some(t => t.token === refreshToken)) {
      return res.status(401).json({ 
        error: 'Refresh token inválido' 
      });
    }

    const tokens = generateTokens(user._id);

    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    user.refreshTokens.push({ token: tokens.refreshToken });
    await user.save();

    res.json({
      message: 'Tokens renovados com sucesso',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

router.post('/logout', validateRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (jwtError) {
      return res.status(200).json({ 
        message: 'Logout realizado' 
      });
    }

    const user = await User.findById(decoded.userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
    }

    res.json({ 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;