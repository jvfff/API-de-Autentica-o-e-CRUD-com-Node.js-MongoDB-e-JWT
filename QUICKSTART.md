# 🚀 Guia de Início Rápido

Este guia vai te ajudar a colocar a API funcionando em poucos minutos.

## ⚡ Setup Rápido (5 minutos)

### 1. Clone e configure
```bash
git clone <repository-url>
cd api-auth-crud-jwt
npm install
cp .env.example .env
```

### 2. Configure as variáveis de ambiente
Edite o arquivo `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/api-auth-crud
ACCESS_TOKEN_SECRET=gere_uma_chave_forte_aqui
REFRESH_TOKEN_SECRET=gere_outra_chave_forte_aqui
PORT=3000
NODE_ENV=development
```

**💡 Dica:** Para gerar chaves fortes, use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Inicie a API
```bash

npm run dev

npm run dev:docker

npm run dev:docker-tools
```

### 4. Teste a API
Acesse: http://localhost:3000

Você verá a mensagem de boas-vindas da API! 🎉

## 📖 Documentação Interativa

A API possui documentação Swagger completa:
- **Swagger UI:** http://localhost:3000/api-docs
- **JSON:** http://localhost:3000/api-docs.json

## 🧪 Testando com dados de exemplo

### Popule o banco com dados de teste:
```bash
npm run db:seed
```

Isso criará 3 usuários de teste:
- `joao@email.com` | senha: `123456`
- `maria@email.com` | senha: `123456`
- `pedro@email.com` | senha: `123456`

### Teste rápido com cURL:
```bash

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"123456"}'

curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI" \
  -d '{"title":"Minha primeira tarefa"}'

curl -X GET http://localhost:3000/todos \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

## 🛠 Comandos Úteis

### Desenvolvimento
```bash
npm run dev           # Inicia com nodemon
npm run test          # Executa testes
npm run test:watch    # Testes em modo watch
npm run test:coverage # Testes com cobertura
npm run lint          # Verifica código
npm run lint:fix      # Corrige problemas de lint
```

### Banco de dados
```bash
npm run db:seed       # Popula com dados de teste
npm run db:reset      # Limpa todos os dados
```

### Docker
```bash
npm run dev:docker           # API + MongoDB
npm run dev:docker-tools     # + Mongo Express (port 8081)
npm run docker:build         # Build da imagem
```

### Produção
```bash
npm start             # Inicia em produção
npm run prod:pm2      # Inicia com PM2
```

## 🔥 Recursos Principais

### ✅ Autenticação JWT Completa
- Registro e login de usuários
- Access tokens (15 min) + Refresh tokens (30 dias)
- Middleware de autenticação automática
- Rate limiting para proteger contra ataques

### ✅ CRUD Completo de Tarefas
- Criar, listar, atualizar e deletar tarefas
- Associação automática ao usuário logado
- Paginação e filtros
- Validação rigorosa de dados

### ✅ Segurança Robusta
- Senhas hasheadas com bcrypt
- Headers de segurança com Helmet
- CORS configurável
- Validação com Zod
- Rate limiting inteligente

### ✅ Qualidade de Código
- Testes automatizados (Jest + Supertest)
- ESLint + Prettier configurados
- Cobertura de testes
- CI/CD com GitHub Actions

### ✅ Documentação Completa
- Swagger/OpenAPI 3.0
- README detalhado
- Guias de deploy e segurança
- Collection do Postman

## 📊 Endpoints Principais

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrar usuário | ❌ |
| POST | `/auth/login` | Fazer login | ❌ |
| POST | `/auth/refresh` | Renovar tokens | ❌ |
| POST | `/auth/logout` | Fazer logout | ❌ |
| GET | `/me` | Dados do usuário | ✅ |
| POST | `/todos` | Criar tarefa | ✅ |
| GET | `/todos` | Listar tarefas | ✅ |
| GET | `/todos/:id` | Obter tarefa | ✅ |
| PUT | `/todos/:id` | Atualizar tarefa | ✅ |
| DELETE | `/todos/:id` | Deletar tarefa | ✅ |

## 🚨 Solução de Problemas

### MongoDB não conecta?
```bash

sudo apt install mongodb

docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### Porta 3000 em uso?
```bash

lsof -i :3000

kill -9 <PID>

PORT=3001
```

### Problemas com dependências?
```bash

rm -rf node_modules package-lock.json
npm install
```

### JWT_SECRET não definido?
Certifique-se que o arquivo `.env` existe e contém as chaves:
```bash

ls -la .env

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🎯 Próximos Passos

1. **Teste a API:** Use o Swagger UI ou Postman
2. **Execute os testes:** `npm test`
3. **Explore o código:** Entenda a estrutura do projeto
4. **Customize:** Adicione suas próprias funcionalidades
5. **Deploy:** Use os guias em `DEPLOYMENT.md`

## 📚 Documentação Completa

- **README.md** - Documentação detalhada
- **DEPLOYMENT.md** - Guia de deploy
- **SECURITY.md** - Práticas de segurança
- **api-collection.json** - Collection do Postman
- **/api-docs** - Documentação interativa

## 🆘 Precisa de Ajuda?

1. Verifique os logs da aplicação
2. Consulte a documentação Swagger
3. Execute os testes para verificar integridade
4. Verifique as issues no GitHub

**API funcionando? Hora de construir algo incrível! 🚀**