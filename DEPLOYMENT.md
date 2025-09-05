# 🚀 Guia de Deploy

Este documento contém instruções detalhadas para fazer deploy da API em diferentes ambientes.

## 📋 Pré-requisitos

- Node.js 16+ 
- MongoDB (local ou cloud)
- PM2 (para produção)
- Nginx (opcional, como proxy reverso)
- SSL/TLS certificate (para HTTPS)

## 🔧 Configuração de Ambiente

### Desenvolvimento Local

1. **Clone e configure:**
```bash
git clone <repository-url>
cd api-auth-crud-jwt
npm install
cp .env.example .env
```

2. **Edite o .env:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/api-auth-crud
ACCESS_TOKEN_SECRET=dev_super_secret_key_123
REFRESH_TOKEN_SECRET=dev_super_secret_refresh_123
PORT=3000
```

3. **Inicie:**
```bash
npm run dev
```

### Com Docker Compose

```bash
npm run dev:docker

npm run dev:docker-tools
```

## 🌐 Deploy em Produção

### 1. Servidor VPS/Dedicado

#### Preparação do Servidor
```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g pm2

wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Deploy da Aplicação
```bash
git clone <repository-url> /var/www/api-auth-crud
cd /var/www/api-auth-crud

npm ci --only=production

sudo nano .env
```

#### Configuração .env Produção
```env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/api-auth-crud-prod
ACCESS_TOKEN_SECRET=sua_chave_super_forte_512_caracteres
REFRESH_TOKEN_SECRET=sua_outra_chave_super_forte_512_caracteres
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d
PORT=3000
```

#### Configurar PM2
```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'api-auth-crud',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

mkdir logs

pm2 start ecosystem.config.js --env production

pm2 save

pm2 startup
```

### 2. Deploy com Docker

#### Build da Imagem
```bash
docker build -t api-auth-crud .

docker tag api-auth-crud your-registry/api-auth-crud:latest

docker push your-registry/api-auth-crud:latest
```

#### Docker Compose Produção
```yaml
version: '3.8'
services:
  api:
    image: your-registry/api-auth-crud:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/api-auth-crud-prod
      - ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
      - REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
    depends_on:
      - mongo
    networks:
      - api-network

  mongo:
    image: mongo:6.0
    restart: always
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASS}
    networks:
      - api-network

volumes:
  mongo_data:

networks:
  api-network:
    driver: bridge
```

### 3. Deploy na Cloud

#### Heroku
```bash
heroku login

heroku create api-auth-crud-app

heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/prod"
heroku config:set ACCESS_TOKEN_SECRET="sua_chave_forte"
heroku config:set REFRESH_TOKEN_SECRET="sua_outra_chave_forte"

git push heroku main
```

#### Railway
```bash
npm install -g @railway/cli

railway login
railway init
railway up
```

#### DigitalOcean App Platform
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

## 🔒 Configuração de Segurança

### Nginx como Proxy Reverso
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Monitoramento

### PM2 Monitoring
```bash
pm2 monit

pm2 logs

pm2 status

pm2 restart all
```

### Health Checks
A API inclui endpoints para monitoramento:
- `GET /` - Status básico da API
- Health check automático no Docker

### Logs
Configure logs estruturados para produção:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## 🔄 CI/CD

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to server
      run: |
        # Comandos de deploy específicos
```

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] Testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets de produção gerados
- [ ] Banco de dados configurado
- [ ] Domínio e DNS configurados
- [ ] SSL/TLS configurado

### Pós-Deploy
- [ ] API funcionando corretamente
- [ ] Endpoints respondendo
- [ ] Autenticação funcionando
- [ ] Rate limiting ativo
- [ ] Logs sendo gerados
- [ ] Monitoring configurado
- [ ] Backup configurado

## 🚨 Troubleshooting

### Problemas Comuns

**Erro de conexão MongoDB:**
```bash
sudo systemctl status mongod

sudo journalctl -u mongod
```

**PM2 não iniciando:**
```bash
pm2 logs

pm2 restart all
```

**Porta em uso:**
```bash
sudo lsof -i :3000

sudo kill -9 <PID>
```

### Performance Issues
- Use clustering com PM2
- Implemente cache com Redis
- Otimize consultas MongoDB
- Configure CDN para assets

## 📞 Suporte

Para problemas de deploy:
1. Verificar logs da aplicação
2. Confirmar variáveis de ambiente
3. Testar conectividade com MongoDB
4. Verificar configurações de firewall/proxy