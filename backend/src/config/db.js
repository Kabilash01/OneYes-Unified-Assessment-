const mongoose = require('mongoose');
const winston = require('winston');

/**
 * Connect to MongoDB
 * @description Establishes connection to MongoDB with retry logic
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are now default in Mongoose 6+
      // but included for clarity and compatibility
    });

    winston.info(`MongoDB Connected: ${conn.connection.host}`);

    // Connection events
    mongoose.connection.on('connected', () => {
      winston.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      winston.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      winston.warn('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      winston.info('Mongoose connection closed due to application termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    winston.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Retry connection after 5 seconds
    winston.info('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
