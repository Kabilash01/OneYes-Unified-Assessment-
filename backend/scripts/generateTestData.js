/**
 * Test Data Generator for Phase 1
 * Run this script to populate database with sample assessments
 * 
 * Usage: node scripts/generateTestData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('../src/models/User');
const Assessment = require('../src/models/Assessment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unified-assessment';

// Sample data
const subjects = ['Mathematics', 'Science', 'Programming', 'English', 'History'];
const questionTypes = ['mcq', 'short', 'long'];

const generateTestData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ email: { $regex: /^test/ } });
    await Assessment.deleteMany({ title: { $regex: /^Test/ } });

    // Create test users
    console.log('👥 Creating test users...');

    const student = await User.create({
      name: 'Test Student',
      email: 'test.student@example.com',
      password: 'Test123!', // Don't hash - model will do it
      role: 'student',
      instituteCode: 'INST001',
    });

    const instructor1 = await User.create({
      name: 'Dr. John Smith',
      email: 'test.instructor1@example.com',
      password: 'Test123!', // Don't hash - model will do it
      role: 'instructor',
      instituteCode: 'INST001',
    });

    const instructor2 = await User.create({
      name: 'Prof. Sarah Johnson',
      email: 'test.instructor2@example.com',
      password: 'Test123!', // Don't hash - model will do it
      role: 'instructor',
      instituteCode: 'INST001',
    });

    const instructor3 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'test.instructor3@example.com',
      password: 'Test123!', // Don't hash - model will do it
      role: 'instructor',
      instituteCode: 'INST001',
    });

    console.log('✅ Test users created');

    // Create sample assessments
    console.log('📝 Creating sample assessments...');
    const assessments = [];
    const now = new Date();

    // Helper function to create questions
    const createQuestions = (types) => {
      const questions = [];
      types.forEach((type, index) => {
        if (type === 'mcq') {
          questions.push({
            type: 'mcq',
            questionText: `Sample MCQ Question ${index + 1}`,
            marks: 2,
            order: index + 1,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: ['Option A'],
          });
        } else if (type === 'short') {
          questions.push({
            type: 'short',
            questionText: `Sample Short Answer Question ${index + 1}`,
            marks: 3,
            order: index + 1,
          });
        } else {
          questions.push({
            type: 'long',
            questionText: `Sample Long Answer Question ${index + 1}`,
            marks: 5,
            order: index + 1,
          });
        }
      });
      return questions;
    };

    // Assessment 1: Available now, MCQ only
    assessments.push({
      title: 'Test Python Basics Quiz - MCQ Only',
      description: 'Basic Python programming concepts quiz with multiple choice questions',
      subjects: ['Programming'],
      duration: 30,
      totalMarks: 20,
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      questions: createQuestions(['mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'mcq', 'mcq']),
      createdBy: instructor1._id,
      status: 'published',
      isPublic: true,
    });

    // Assessment 2: Available now, Written only
    assessments.push({
      title: 'Test Mathematics Assignment - Written',
      description: 'Solve mathematical problems with detailed explanations',
      subjects: ['Mathematics'],
      duration: 60,
      totalMarks: 30,
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      questions: createQuestions(['short', 'short', 'long', 'long']),
      createdBy: instructor2._id,
      status: 'published',
      isPublic: true,
    });

    // Assessment 3: Available now, Mixed
    assessments.push({
      title: 'Test Science Comprehensive Exam',
      description: 'Comprehensive science exam with MCQ and written sections',
      subjects: ['Science'],
      duration: 90,
      totalMarks: 50,
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      questions: createQuestions(['mcq', 'mcq', 'mcq', 'short', 'short', 'long']),
      createdBy: instructor3._id,
      status: 'published',
      isPublic: true,
    });

    // Assessment 4: Starting soon (tomorrow)
    assessments.push({
      title: 'Test English Literature Quiz',
      description: 'Quiz on classic literature and poetry',
      subjects: ['English'],
      duration: 45,
      totalMarks: 25,
      startDate: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      questions: createQuestions(['mcq', 'mcq', 'mcq', 'short']),
      createdBy: instructor1._id,
      status: 'published',
      isPublic: true,
    });

    // Assessment 5: Deadline soon
    assessments.push({
      title: 'Test History Final Exam',
      description: 'Final examination covering all history topics',
      subjects: ['History'],
      duration: 120,
      totalMarks: 100,
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
      questions: createQuestions(['mcq', 'mcq', 'short', 'short', 'long', 'long']),
      createdBy: instructor2._id,
      status: 'published',
      isPublic: true,
    });

    // Assessment 6: Upcoming
    assessments.push({
      title: 'Test Advanced Programming',
      description: 'Advanced programming concepts and algorithms',
      subjects: ['Programming'],
      duration: 90,
      totalMarks: 60,
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      questions: createQuestions(['mcq', 'short', 'long']),
      createdBy: instructor3._id,
      status: 'published',
      isPublic: true,
    });

    // Assessment 7: Expired
    assessments.push({
      title: 'Test Mathematics Midterm',
      description: 'Midterm examination for mathematics course',
      subjects: ['Mathematics'],
      duration: 60,
      totalMarks: 40,
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      questions: createQuestions(['mcq', 'mcq', 'short']),
      createdBy: instructor1._id,
      status: 'published',
      isPublic: true,
    });

    // Assessment 8-15: More variety
    for (let i = 8; i <= 15; i++) {
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomInstructor = [instructor1, instructor2, instructor3][Math.floor(Math.random() * 3)];
      const randomDuration = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)];
      
      const daysOffset = Math.floor(Math.random() * 20) - 10; // Random between -10 and +10 days
      
      assessments.push({
        title: `Test ${randomSubject} Assessment ${i}`,
        description: `Sample assessment for ${randomSubject} - Test data`,
        subjects: [randomSubject],
        duration: randomDuration,
        totalMarks: randomDuration / 3,
        startDate: new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + (daysOffset + 7) * 24 * 60 * 60 * 1000),
        questions: createQuestions(['mcq', 'short']),
        createdBy: randomInstructor._id,
        status: 'published',
        isPublic: true,
      });
    }

    await Assessment.insertMany(assessments);
    console.log(`✅ Created ${assessments.length} sample assessments`);

    console.log('\n📋 Test Accounts Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍🎓 Student:');
    console.log('   Email: test.student@example.com');
    console.log('   Password: Test123!');
    console.log('\n👨‍🏫 Instructor 1:');
    console.log('   Email: test.instructor1@example.com');
    console.log('   Password: Test123!');
    console.log('   Name: Dr. John Smith');
    console.log('\n👨‍🏫 Instructor 2:');
    console.log('   Email: test.instructor2@example.com');
    console.log('   Password: Test123!');
    console.log('   Name: Prof. Sarah Johnson');
    console.log('\n👨‍🏫 Instructor 3:');
    console.log('   Email: test.instructor3@example.com');
    console.log('   Password: Test123!');
    console.log('   Name: Dr. Michael Chen');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ Test data generation complete!');
    console.log('\n🚀 You can now test Phase 1 features:');
    console.log('   1. Login as test.student@example.com');
    console.log('   2. Go to /student/assessments');
    console.log('   3. Test all 7 filters');
    console.log('   4. Go to /student/calendar');
    console.log('   5. Test calendar color coding and navigation\n');

  } catch (error) {
    console.error('❌ Error generating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
generateTestData();
