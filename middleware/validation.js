const { z } = require('zod');

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Senha é obrigatória')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token é obrigatório')
});

const createTodoSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  done: z.boolean().optional().default(false)
});

const updateTodoSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim()
    .optional(),
  done: z.boolean().optional()
});

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors
        });
      }
      
      next(error);
    }
  };
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      error: 'ID inválido'
    });
  }
  
  next();
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateCreateTodo: validate(createTodoSchema),
  validateUpdateTodo: validate(updateTodoSchema),
  validateObjectId
};