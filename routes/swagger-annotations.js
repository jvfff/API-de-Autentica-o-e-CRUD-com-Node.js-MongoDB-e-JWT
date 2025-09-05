/**
 * @swagger
 * components:
 *   examples:
 *     RegisterRequest:
 *       value:
 *         name: "João Silva"
 *         email: "joao@email.com"
 *         password: "123456"
 *     LoginRequest:
 *       value:
 *         email: "joao@email.com"
 *         password: "123456"
 *     CreateTodoRequest:
 *       value:
 *         title: "Minha nova tarefa"
 *         done: false
 *     UpdateTodoRequest:
 *       value:
 *         title: "Tarefa atualizada"
 *         done: true
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *           examples:
 *             register:
 *               $ref: '#/components/examples/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email já está em uso
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *           examples:
 *             login:
 *               $ref: '#/components/examples/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens renovados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Refresh token inválido
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Fazer logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou ausente
 */

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Criar nova tarefa
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               done:
 *                 type: boolean
 *                 default: false
 *           examples:
 *             create:
 *               $ref: '#/components/examples/CreateTodoRequest'
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *   get:
 *     summary: Listar tarefas do usuário
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: done
 *         schema:
 *           type: boolean
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Obter tarefa específica
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Tarefa não encontrada
 *   put:
 *     summary: Atualizar tarefa
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               done:
 *                 type: boolean
 *           examples:
 *             update:
 *               $ref: '#/components/examples/UpdateTodoRequest'
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Tarefa não encontrada
 *   delete:
 *     summary: Deletar tarefa
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa deletada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Tarefa não encontrada
 */