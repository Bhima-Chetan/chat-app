#!/usr/bin/env node
/**
 * Migration script to transfer data from local MongoDB to Atlas
 * Usage: node migrate-to-atlas.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/chat_app';
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI || ATLAS_URI.includes('<username>')) {
  console.error('❌ Please configure your MONGO_URI in .env file with actual Atlas credentials');
  process.exit(1);
}

async function migrateData() {
  let localConnection, atlasConnection;
  
  try {
    console.log('🔄 Connecting to local MongoDB...');
    localConnection = await mongoose.createConnection(LOCAL_URI);
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    atlasConnection = await mongoose.createConnection(ATLAS_URI);
    
    console.log('✅ Both connections established');
    
    // Get all collections from local database
    const collections = await localConnection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections to migrate`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`🔄 Migrating collection: ${collectionName}`);
      
      // Get data from local collection
      const localCollection = localConnection.db.collection(collectionName);
      const documents = await localCollection.find({}).toArray();
      
      if (documents.length > 0) {
        // Insert data into Atlas collection
        const atlasCollection = atlasConnection.db.collection(collectionName);
        await atlasCollection.insertMany(documents);
        console.log(`✅ Migrated ${documents.length} documents from ${collectionName}`);
      } else {
        console.log(`⚠️  No documents found in ${collectionName}`);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    if (localConnection) await localConnection.close();
    if (atlasConnection) await atlasConnection.close();
    process.exit(0);
  }
}

// Run migration
migrateData();
