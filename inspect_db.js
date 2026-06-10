import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('CONNECTED TO DB');
  
  const db = mongoose.connection.db;
  
  const collections = await db.listCollections().toArray();
  console.log('COLLECTIONS:', collections.map(c => c.name));
  
  const users = await db.collection('users').find().toArray();
  console.log('ALL USERS:');
  console.log(users.map(u => ({ id: u._id, username: u.username, name: u.name, email: u.email, role: u.role })));
  
  for (const coll of collections) {
    if (coll.name.toLowerCase().includes('transaction')) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`Collection ${coll.name} has ${count} docs`);
      if (count > 0) {
        const docs = await db.collection(coll.name).find().toArray();
        console.log(`Sample from ${coll.name}:`, docs.slice(0, 3));
      }
    }
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
