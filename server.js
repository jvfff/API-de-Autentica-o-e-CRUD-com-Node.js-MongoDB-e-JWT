require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const todosRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/auth', authRateLimiter, authRoutes);
app.use('/', userRoutes);
app.use('/todos', todosRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API de Autenticação e CRUD funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: {
      swagger: '/api-docs',
      postman: '/api-collection.json'
    },
    endpoints: {
      auth: '/auth',
      user: '/me',
      todos: '/todos'
    }
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Status da API
 *     description: Retorna informações básicas sobre a API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido'
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      error: `${field} já está em uso`
    });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📖 Documentação disponível em: http://localhost:${PORT}/api-docs`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('💀 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('💀 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;