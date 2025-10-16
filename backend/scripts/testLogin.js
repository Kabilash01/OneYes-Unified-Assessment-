/**
 * Quick Login Test Script
 * Tests if test.student@example.com can login successfully
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unified-assessment';

const testLogin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    const email = 'test.student@example.com';
    const password = 'Test123!';

    console.log(`\n🔍 Looking for user: ${email}`);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found!');
      console.log('\n💡 Run: node scripts/generateTestData.js');
      process.exit(1);
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    if (!user.isActive) {
      console.log('❌ User account is deactivated!');
      process.exit(1);
    }

    console.log(`\n🔐 Testing password: ${password}`);
    const isPasswordValid = await user.comparePassword(password);

    if (isPasswordValid) {
      console.log('✅ Password is correct!');
      console.log('\n📦 User object that will be returned:');
      console.log(JSON.stringify(user.toPublicJSON(), null, 2));
    } else {
      console.log('❌ Password is incorrect!');
      console.log('\n💡 Try regenerating test data: node scripts/generateTestData.js');
    }

    await mongoose.disconnect();
    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();
