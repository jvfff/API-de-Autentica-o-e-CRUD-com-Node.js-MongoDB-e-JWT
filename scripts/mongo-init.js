db = db.getSiblingDB('api-auth-crud');

db.createUser({
  user: 'apiuser',
  pwd: 'apipassword',
  roles: [
    {
      role: 'readWrite',
      db: 'api-auth-crud'
    }
  ]
});

db.users.createIndex({ email: 1 }, { unique: true });
db.todos.createIndex({ owner: 1, createdAt: -1 });

console.log('MongoDB inicializado com sucesso para a API!');