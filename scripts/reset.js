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

const resetDatabase = async () => {
  try {
    console.log('🗑️  Iniciando reset do banco de dados...\n');

    const userCount = await User.countDocuments();
    const todoCount = await Todo.countDocuments();

    console.log(`📊 Dados atuais:`);
    console.log(`   - Usuários: ${userCount}`);
    console.log(`   - Todos: ${todoCount}\n`);

    if (userCount === 0 && todoCount === 0) {
      console.log('ℹ️  Banco de dados já está vazio');
      return;
    }

    if (process.env.NODE_ENV !== 'development') {
      console.log('⚠️  Este script só deve ser executado em ambiente de desenvolvimento!');
      return;
    }

    const userResult = await User.deleteMany({});
    const todoResult = await Todo.deleteMany({});

    console.log('✅ Reset concluído:');
    console.log(`   - ${userResult.deletedCount} usuários removidos`);
    console.log(`   - ${todoResult.deletedCount} todos removidos`);

    console.log('\n💡 Para popular o banco novamente, execute: npm run db:seed');

  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB fechada');
  }
};

(async () => {
  await connectDB();
  await resetDatabase();
})();