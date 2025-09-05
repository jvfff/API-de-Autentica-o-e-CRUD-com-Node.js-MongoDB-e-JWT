const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('Erro de conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Conexão MongoDB fechada devido ao encerramento da aplicação');
      process.exit(0);
    });

  } catch (error) {
    console.error('Erro ao conectar com MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;