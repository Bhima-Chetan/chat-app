const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://bhimachetan1:8lJr9idGvlJRodRe@cluster0.adpptxr.mongodb.net/chat_app?retryWrites=true&w=majority&appName=Cluster0';

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Get database info
    const db = mongoose.connection.db;
    console.log(`📂 Database: ${db.databaseName}`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Count documents in each collection
    console.log('\n📊 Document counts:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }

    // Show sample users (if any)
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).limit(5).toArray();
    
    if (users.length > 0) {
      console.log('\n👥 Sample Users:');
      users.forEach(user => {
        console.log(`  - Username: ${user.username}, Created: ${user.createdAt || 'N/A'}`);
      });
    } else {
      console.log('\n👥 No users found in database');
    }

    // Show sample messages (if any)
    const messagesCollection = db.collection('messages');
    const messages = await messagesCollection.find({}).limit(5).toArray();
    
    if (messages.length > 0) {
      console.log('\n💬 Sample Messages:');
      messages.forEach(msg => {
        console.log(`  - Message: "${msg.message}", Time: ${msg.timestamp || 'N/A'}`);
      });
    } else {
      console.log('\n💬 No messages found in database');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the check
checkDatabase();
