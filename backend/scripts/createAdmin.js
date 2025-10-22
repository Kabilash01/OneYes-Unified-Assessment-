const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

// Admin credentials
const adminCredentials = {
  name: 'Admin User',
  email: 'admin@oneyes.com',
  password: 'Admin@123',
  role: 'admin',
  instituteCode: 'ONEYES-ADMIN',
  isActive: true,
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unified-assessment');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminCredentials.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📧 Admin Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email:    ${adminCredentials.email}`);
      console.log(`Password: ${adminCredentials.password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Update password - let the pre('save') middleware handle hashing
      existingAdmin.password = adminCredentials.password;
      await existingAdmin.save();
      console.log('✅ Admin password updated!\n');
    } else {
      // Create new admin user - let the pre('save') middleware handle hashing
      const admin = new User({
        name: adminCredentials.name,
        email: adminCredentials.email,
        password: adminCredentials.password, // Don't hash here, middleware will do it
        role: adminCredentials.role,
        instituteCode: adminCredentials.instituteCode,
        isActive: adminCredentials.isActive,
      });

      await admin.save();
      
      console.log('✅ Admin user created successfully!\n');
      console.log('📧 Admin Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email:    ${adminCredentials.email}`);
      console.log(`Password: ${adminCredentials.password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('🔗 Login URL: http://localhost:5173/login');
    console.log('🔗 Admin Dashboard: http://localhost:5173/admin-dashboard\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createAdminUser();
