require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('1. Loading dependencies...');
const express = require('express');
const connectDB = require('./src/config/db');

console.log('2. Creating Express app...');
const app = express();

console.log('3. Connecting to MongoDB...');
connectDB()
  .then(() => {
    console.log('✅ MongoDB connected!');
    
    console.log('4. Setting up routes...');
    app.get('/health', (req, res) => {
      res.json({ success: true, message: 'Server is running' });
    });
    
    console.log('5. Starting server...');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Catch any unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
