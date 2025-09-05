const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    minlength: [1, 'Título não pode estar vazio'],
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  done: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

todoSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Todo', todoSchema);