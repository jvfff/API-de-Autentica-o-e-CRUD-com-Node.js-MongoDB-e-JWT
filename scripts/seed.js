require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Todo = require('../models/Todo');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    await User.deleteMany({});
    await Todo.deleteMany({});
    console.log('🗑️  Dados existentes removidos');

    const users = [
      {
        name: 'João Silva',
        email: 'joao@email.com',
        password: '123456'
      },
      {
        name: 'Maria Santos',
        email: 'maria@email.com',
        password: '123456'
      },
      {
        name: 'Pedro Oliveira',
        email: 'pedro@email.com',
        password: '123456'
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`👥 ${createdUsers.length} usuários criados:`);
    createdUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    const todos = [
      {
        title: 'Estudar Node.js',
        done: false,
        owner: createdUsers[0]._id
      },
      {
        title: 'Fazer exercícios',
        done: true,
        owner: createdUsers[0]._id
      },
      {
        title: 'Ler um livro',
        done: false,
        owner: createdUsers[0]._id
      },
      {
        title: 'Preparar apresentação',
        done: false,
        owner: createdUsers[1]._id
      },
      {
        title: 'Reunião de equipe',
        done: true,
        owner: createdUsers[1]._id
      },
      {
        title: 'Revisar código',
        done: false,
        owner: createdUsers[1]._id
      },
      {
        title: 'Documentar API',
        done: false,
        owner: createdUsers[1]._id
      },
      {
        title: 'Comprar café',
        done: true,
        owner: createdUsers[2]._id
      },
      {
        title: 'Ligar para o cliente',
        done: false,
        owner: createdUsers[2]._id
      }
    ];

    const createdTodos = await Todo.create(todos);
    console.log(`\n✅ ${createdTodos.length} todos criados:`);
    
    for (const user of createdUsers) {
      const userTodos = createdTodos.filter(todo => 
        todo.owner.toString() === user._id.toString()
      );
      console.log(`   ${user.name}: ${userTodos.length} todos`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Dados para teste:');
    console.log('Email: joao@email.com | Senha: 123456');
    console.log('Email: maria@email.com | Senha: 123456');
    console.log('Email: pedro@email.com | Senha: 123456');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB fechada');
  }
};

(async () => {
  await connectDB();
  await seedData();
})();