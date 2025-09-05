# API de Autenticação e CRUD com JWT

Uma API REST completa desenvolvida em Node.js com MongoDB que implementa autenticação JWT (access + refresh tokens) e um sistema CRUD para gerenciamento de tarefas (todos).

## 🚀 Funcionalidades

- ✅ Autenticação JWT com access e refresh tokens
- ✅ CRUD completo para tarefas (todos)
- ✅ Proteção de rotas com middleware de autenticação  
- ✅ Validação de dados com Zod
- ✅ Hash de senhas com bcrypt
- ✅ CORS configurado
- ✅ Tratamento de erros centralizado
- ✅ Paginação para listagem de tarefas
- ✅ Associação de tarefas por usuário

## 🛠 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de schemas
- **CORS** - Habilitação de requisições cross-origin

## 📋 Pré-requisitos

- Node.js (versão 16+)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## ⚙️ Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd api-auth-crud-jwt
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Edite o arquivo `.env` com suas configurações:**
```env
MONGODB_URI=mongodb://localhost:27017/api-auth-crud
ACCESS_TOKEN_SECRET=sua_chave_super_secreta_para_access_token
REFRESH_TOKEN_SECRET=sua_chave_super_secreta_para_refresh_token
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d
PORT=3000
NODE_ENV=development
```

5. **Inicie o servidor:**
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

## 📚 Documentação da API

### Base URL
```
http://localhost:3000
```

### 🔐 Autenticação

#### Registrar Usuário
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com", 
  "password": "123456"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "647abc123def456789",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Fazer Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Resposta (200):**
```json
{
  "message": "Login realizado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "647abc123def456789",
    "name": "João Silva", 
    "email": "joao@email.com"
  }
}
```

#### Renovar Token
```http
POST /auth/refresh
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Resposta (200):**
```json
{
  "message": "Tokens renovados com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### Logout
```http
POST /auth/logout
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 👤 Usuário

#### Obter Dados do Usuário
```http
GET /me
Authorization: Bearer <access_token>
```

**Resposta (200):**
```json
{
  "message": "Dados do usuário obtidos com sucesso",
  "user": {
    "_id": "647abc123def456789",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### ✅ Tarefas (Todos)

> **Nota:** Todas as rotas de todos requerem autenticação via header Authorization: Bearer <access_token>

#### Criar Tarefa
```http
POST /todos
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "title": "Minha nova tarefa",
  "done": false
}
```

**Resposta (201):**
```json
{
  "message": "Todo criado com sucesso",
  "todo": {
    "_id": "647def123abc456789",
    "title": "Minha nova tarefa",
    "done": false,
    "owner": "647abc123def456789",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Listar Tarefas
```http
GET /todos?page=1&limit=10&done=false
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)  
- `limit` (opcional): Itens por página (padrão: 10)
- `done` (opcional): Filtrar por status (true/false)

**Resposta (200):**
```json
{
  "message": "Todos obtidos com sucesso",
  "todos": [
    {
      "_id": "647def123abc456789",
      "title": "Minha tarefa",
      "done": false,
      "owner": "647abc123def456789",
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 1,
    "count": 1,
    "totalItems": 1
  }
}
```

#### Obter Tarefa Específica
```http
GET /todos/:id
Authorization: Bearer <access_token>
```

#### Atualizar Tarefa
```http
PUT /todos/:id
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "title": "Tarefa atualizada",
  "done": true
}
```

#### Deletar Tarefa
```http
DELETE /todos/:id
Authorization: Bearer <access_token>
```

## 🔒 Segurança

### Tokens JWT
- **Access Token**: Expira em 15 minutos
- **Refresh Token**: Expira em 30 dias
- Tokens armazenados no banco para controle de revogação

### Senhas
- Hash com bcrypt (salt rounds: 12)
- Nunca retornadas nas respostas da API

### Validações
- Validação robusta com Zod
- Sanitização de dados de entrada
- Verificação de tipos e formatos

## 📊 Códigos de Status

- **200**: Sucesso
- **201**: Criado com sucesso  
- **400**: Dados inválidos
- **401**: Não autorizado/Token inválido
- **404**: Recurso não encontrado
- **409**: Conflito (ex: email já existe)
- **500**: Erro interno do servidor

## 🧪 Testando a API

### Com cURL

1. **Registrar:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@email.com",
    "password": "123456"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com", 
    "password": "123456"
  }'
```

3. **Criar Todo:**
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "title": "Minha primeira tarefa",
    "done": false
  }'
```

### Collection para Postman/Insomnia

Importe a collection disponível no arquivo `api-collection.json` (veja próximo artefato).

## 🚀 Deploy

### Variáveis de Produção
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
ACCESS_TOKEN_SECRET=chave_super_forte_access_512_caracteres
REFRESH_TOKEN_SECRET=chave_super_forte_refresh_512_caracteres
```

### Recomendações
- Use HTTPS em produção
- Configure Rate Limiting
- Implemente logs estruturados
- Use variáveis de ambiente seguras

## 📝 Estrutura do Projeto

```
├── config/
│   └── database.js          # Configuração MongoDB
├── middleware/
│   ├── auth.js              # Middleware de autenticação
│   └── validation.js        # Validações Zod
├── models/
│   ├── User.js              # Modelo de usuário
│   └── Todo.js              # Modelo de tarefa
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── user.js              # Rotas de usuário
│   └── todos.js             # Rotas de tarefas
├── .env.example             # Exemplo de variáveis
├── package.json
├── server.js                # Arquivo principal
└── README.md
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.