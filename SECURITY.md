# 🔒 Guia de Segurança

Este documento detalha as práticas de segurança implementadas na API e recomendações adicionais para produção.

## 🛡️ Segurança Implementada

### Autenticação JWT
- **Access Tokens**: Curta duração (15 min)
- **Refresh Tokens**: Longa duração (30 dias) 
- **Rotação**: Tokens são rotacionados a cada refresh
- **Revogação**: Refresh tokens são armazenados e podem ser revogados

### Criptografia de Senhas
- **bcrypt**: Salt rounds = 12
- **Hash timing**: Resistente a ataques de timing
- **Validação**: Senhas nunca retornadas nas respostas

### Rate Limiting
- **Autenticação**: 5 tentativas por 15 min
- **API Geral**: 100 requests por 15 min
- **Headers informativos**: X-RateLimit-*

### Validação de Dados
- **Zod**: Validação rigorosa de schemas
- **Sanitização**: Dados limpos antes do processamento
- **Tipos**: Verificação de tipos e formatos

## 🔐 Configurações de Segurança

### JWT Secrets
```bash

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Recomendações:**
- Use secrets diferentes para access/refresh
- Secrets com 64+ caracteres
- Nunca commite secrets no código
- Rotacione secrets periodicamente

### Variáveis de Ambiente Seguras
```env
# NUNCA usar valores padrão em produção
ACCESS_TOKEN_SECRET=<64-char-random-string>
REFRESH_TOKEN_SECRET=<64-char-random-string>
MONGODB_URI=mongodb+srv://user:strongpass@cluster.mongodb.net/db
```

## 🚨 Vulnerabilidades Mitigadas

### OWASP Top 10

1. **A01:2021 – Broken Access Control**
   - ✅ Middleware de autenticação em todas rotas protegidas
   - ✅ Verificação de ownership nos recursos (todos)
   - ✅ Princípio do menor privilégio

2. **A02:2021 – Cryptographic Failures**
   - ✅ HTTPS obrigatório (configurar proxy reverso)
   - ✅ Senhas hasheadas com bcrypt
   - ✅ JWT secrets fortes

3. **A03:2021 – Injection**
   - ✅ Mongoose ODM previne NoSQL injection
   - ✅ Validação rigorosa com Zod
   - ✅ Sanitização de entrada

4. **A05:2021 – Security Misconfiguration**
   - ✅ Headers de segurança configurados
   - ✅ CORS restritivo
   - ✅ Informações sensíveis não expostas

5. **A06:2021 – Vulnerable Components**
   - ✅ Dependências atualizadas
   - ⚠️ Executar `npm audit` regularmente

6. **A07:2021 – Authentication Failures**
   - ✅ Rate limiting em login
   - ✅ Tokens com expiração
   - ✅ Logout adequado

## 🔧 Melhorias de Segurança Recomendadas

### Headers de Segurança
```javascript
// Adicionar ao server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Rate Limiting Avançado (Redis)
```javascript
const redis = require('redis');
const client = redis.createClient();

const advancedRateLimit = async (req, res, next) => {
  const key = `rate_limit:${req.ip}`;
  const current = await client.incr(key);
  
  if (current === 1) {
    await client.expire(key, 900);
  }
  
  if (current > 100) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
};
```

### Logging de Segurança
```javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log'
    })
  ]
});

const logSecurityEvent = (event, req, additional = {}) => {
  securityLogger.info({
    event,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    ...additional
  });
};
```

### Validação de Input Avançada
```javascript

const xss = require('xss');

const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};
```

### Monitoramento de Tentativas de Acesso
```javascript
const suspiciousActivity = new Map();

const detectSuspiciousActivity = (req, res, next) => {
  const key = req.ip;
  const activity = suspiciousActivity.get(key) || { count: 0, lastAttempt: Date.now() };
  
  if (Date.now() - activity.lastAttempt > 3600000) {
    activity.count = 0;
  }
  
  activity.count++;
  activity.lastAttempt = Date.now();
  
  if (activity.count > 50) {
    logSecurityEvent('SUSPICIOUS_ACTIVITY', req, { 
      attempts: activity.count 
    });
    
    return res.status(429).json({ 
      error: 'Atividade suspeita detectada' 
    });
  }
  
  suspiciousActivity.set(key, activity);
  next();
};
```

## 🔍 Auditoria e Compliance

### Logs de Auditoria
```javascript
const auditLog = (action, userId, resource, details = {}) => {
  console.log({
    timestamp: new Date().toISOString(),
    action,
    userId,
    resource,
    details
  });
};

auditLog('USER_LOGIN', user._id, 'auth', { ip: req.ip });
auditLog('TODO_DELETE', req.userId, 'todo', { todoId: req.params.id });
```

### Backup Seguro
```bash
#!/bin/bash

BACKUP_DIR="/secure/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongo_$DATE"
tar -czf "$BACKUP_DIR/mongo_$DATE.tar.gz" "$BACKUP_DIR/mongo_$DATE"
gpg --symmetric --cipher-algo AES256 "$BACKUP_DIR/mongo_$DATE.tar.gz"
rm -rf "$BACKUP_DIR/mongo_$DATE" "$BACKUP_DIR/mongo_$DATE.tar.gz"

find "$BACKUP_DIR" -name "mongo_*.gpg" -mtime +30 -delete
```

## 🚨 Resposta a Incidentes

### Detecção de Problemas
1. **Múltiplas tentativas de login falhadas**
2. **Requests anômalos em volume**
3. **Tentativas de acesso a recursos não autorizados**
4. **Payloads maliciosos**

### Procedimentos de Resposta
```javascript

const blockedIPs = new Set();

const autoBlock = (req, res, next) => {
  if (blockedIPs.has(req.ip)) {
    return res.status(403).json({ 
      error: 'IP bloqueado por atividade suspeita' 
    });
  }
  next();
};

const blockIP = (ip, reason) => {
  blockedIPs.add(ip);
  logSecurityEvent('IP_BLOCKED', { ip }, { reason });
  
  setTimeout(() => {
    blockedIPs.delete(ip);
    logSecurityEvent('IP_UNBLOCKED', { ip });
  }, 24 * 60 * 60 * 1000);
};
```

## 📋 Checklist de Segurança

### Desenvolvimento
- [ ] Secrets não commitados
- [ ] Validação de todos inputs
- [ ] Testes de segurança básicos
- [ ] Dependências atualizadas

### Deploy
- [ ] HTTPS configurado
- [ ] Headers de segurança ativos
- [ ] Rate limiting configurado
- [ ] Logs de segurança ativos
- [ ] Firewall configurado
- [ ] Backup automático configurado

### Monitoramento
- [ ] Alertas de tentativas de login falhadas
- [ ] Monitoramento de rate limits
- [ ] Logs de auditoria configurados
- [ ] Dashboards de segurança

### Manutenção
- [ ] Revisão regular de logs
- [ ] Atualização de dependências
- [ ] Rotação de secrets
- [ ] Testes de penetração periódicos

## 🔬 Testes de Segurança

### Testes Automatizados
```bash

npm audit

npm install -g snyk
snyk test

npm install -g jshint
jshint server.js
```

### Testes Manuais
```bash

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  --repeat 10

curl -X POST http://localhost:3000/todos \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"<script>alert(\"xss\")</script>"}'
```

## 📚 Recursos Adicionais

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)

## 🚨 Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança:

1. **NÃO** crie uma issue pública
2. Envie email para: security@yourdomain.com
3. Inclua:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se houver)

Responderemos em até 48 horas.