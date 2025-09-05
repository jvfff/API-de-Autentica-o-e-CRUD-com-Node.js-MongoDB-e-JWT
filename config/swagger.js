const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Autenticação e CRUD',
      version: '1.0.0',
      description: 'Uma API REST completa com autenticação JWT e sistema CRUD para tarefas',
      contact: {
        name: 'Desenvolvedor',
        email: 'dev@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtido através do login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        Todo: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único da tarefa'
            },
            title: {
              type: 'string',
              description: 'Título da tarefa'
            },
            done: {
              type: 'boolean',
              description: 'Status de conclusão'
            },
            owner: {
              type: 'string',
              description: 'ID do usuário proprietário'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token (15 min)'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token (30 dias)'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            current: {
              type: 'integer',
              description: 'Página atual'
            },
            total: {
              type: 'integer', 
              description: 'Total de páginas'
            },
            count: {
              type: 'integer',
              description: 'Itens na página atual'
            },
            totalItems: {
              type: 'integer',
              description: 'Total de itens'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticação'
      },
      {
        name: 'User',
        description: 'Endpoints de usuário'
      },
      {
        name: 'Todos',
        description: 'Endpoints de tarefas (CRUD)'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation'
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = { setupSwagger, specs };