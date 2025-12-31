// seed.js
// Run with: node seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from './Models/UserModel.js';
import ProductModel from './Models/ProductModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const users = [
  { name: 'Alice', email: 'alice@example.com', password: 'Password123!' },
  { name: 'Bob', email: 'bob@example.com', password: 'Password123!' },
  { name: 'Charlie', email: 'charlie@example.com', password: 'Password123!' }
];

const now = new Date();
const products = [
  {
    name: 'Vintage Clock',
    description: 'A beautiful old clock.',
    startingPrice: 100,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    latitude: 40.7128,
    longitude: -74.0060,
    endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
  },
  {
    name: 'Antique Vase',
    description: 'Rare porcelain vase.',
    startingPrice: 200,
    imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    latitude: 34.0522,
    longitude: -118.2437,
    endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48 hours from now
  },
  {
    name: 'Painting',
    description: 'Original oil painting.',
    startingPrice: 300,
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    latitude: 51.5074,
    longitude: -0.1278,
    endTime: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 72 hours from now
  },
  {
    name: 'Classic Car',
    description: 'Restored 1960s convertible.',
    startingPrice: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
    latitude: 37.7749,
    longitude: -122.4194,
    endTime: new Date(now.getTime() + 96 * 60 * 60 * 1000), // 96 hours from now
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    const createdUsers = await UserModel.insertMany(users);
    console.log('Users seeded:', createdUsers.map(u => u.email));

    // Assign owner to products
    const createdProducts = await ProductModel.insertMany(products);
    console.log('Products seeded:', createdProducts.map(p => p.name));

    await mongoose.disconnect();
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
