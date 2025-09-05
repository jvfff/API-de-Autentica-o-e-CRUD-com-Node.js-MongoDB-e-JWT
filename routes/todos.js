const express = require('express');
const Todo = require('../models/Todo');
const authMiddleware = require('../middleware/auth');
const { 
  validateCreateTodo, 
  validateUpdateTodo, 
  validateObjectId 
} = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateCreateTodo, async (req, res) => {
  try {
    const { title, done } = req.body;

    const todo = new Todo({
      title,
      done,
      owner: req.userId
    });

    await todo.save();

    res.status(201).json({
      message: 'Todo criado com sucesso',
      todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, done } = req.query;
    const skip = (page - 1) * limit;

    const filter = { owner: req.userId };
    if (done !== undefined) {
      filter.done = done === 'true';
    }

    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Todo.countDocuments(filter);

    res.json({
      message: 'Todos obtidos com sucesso',
      todos,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: todos.length,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      owner: req.userId 
    });

    if (!todo) {
      return res.status(404).json({ 
        error: 'Todo não encontrado' 
      });
    }

    res.json({
      message: 'Todo obtido com sucesso',
      todo
    });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

router.put('/:id', validateObjectId, validateUpdateTodo, async (req, res) => {
  try {
    const { title, done } = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { 
        ...(title !== undefined && { title }),
        ...(done !== undefined && { done })
      },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ 
        error: 'Todo não encontrado' 
      });
    }

    res.json({
      message: 'Todo atualizado com sucesso',
      todo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    
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

    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.userId 
    });

    if (!todo) {
      return res.status(404).json({ 
        error: 'Todo não encontrado' 
      });
    }

    res.json({
      message: 'Todo deletado com sucesso',
      todo
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;