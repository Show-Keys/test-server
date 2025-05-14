import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import UserModel from './Models/UserModel.js';
import ProductModel from './Models/ProductModel.js';
import BidModel from './Models/BidModel.js';

dotenv.config();

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect('mongodb+srv://admin:1234@cluster0.p9f90.mongodb.net/ActionDB?retryWrites=true&w=majority')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ====================================
// USER ROUTES
// ====================================

// Register User
app.post("/registerUser", async (req, res) => {
  try {
    const existing = await UserModel.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({
      success: false,
      message: "User already exists"
    });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new UserModel({ ...req.body, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration error: " + error.message
    });
  }
});

// Login User
app.post("/loginUser", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("Invalid email");

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).send("Invalid password");

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilepic: user.profilepic,
        nationalId: user.nationalId,
      },
    });
  } catch (error) {
    res.status(500).send("Login error: " + error.message);
  }
});

// Get All Users (excluding passwords)
app.get('/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).send("Fetch users error: " + error.message);
  }
});

// Get Single User by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    res.status(500).send('Fetch error: ' + err.message);
  }
});

// Update User by ID
app.put('/users/:id', async (req, res) => {
  try {
    const updateData = {
      fullName: req.body.fullName,
      email: req.body.email,
      role: req.body.role,
      nationalId: req.body.nationalId,
      profilepic: req.body.profilepic,
    };

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).send('User not found');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Update error: ' + err.message);
  }
});

// Delete User
app.delete('/users/:id', async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send("Delete user error: " + error.message);
  }
});


// ====================================
// PRODUCT ROUTES
// ====================================

// Add New Product
app.post('/addProduct', async (req, res) => {
  try {
    const { name, description, startingPrice, imageUrl, latitude, longitude, endTime } = req.body;

    // Validate all required fields
    if (!name || !description || !startingPrice || !imageUrl || !latitude || !longitude || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, description, startingPrice, imageUrl, latitude, longitude, and endTime'
      });
    }

    // Validate numeric fields
    if (isNaN(startingPrice) || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'startingPrice, latitude, and longitude must be valid numbers'
      });
    }

    // Validate date
    const endDate = new Date(endTime);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end time format'
      });
    }

    // Validate location coordinates
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90 degrees'
      });
    }
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180 degrees'
      });
    }

    const newProduct = new ProductModel({
      name,
      description,
      startingPrice,
      imageUrl,
      latitude,
      longitude,
      endTime: endDate
    });

    await newProduct.save();
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product',
      error: error.message
    });
  }
});

// Get All Products
app.get('/getProducts', async (req, res) => {
  try {
    const products = await ProductModel.find({});
    res.json(products);
  } catch (err) {
    res.status(500).send("Error fetching products: " + err.message);
  }
});

// Get Product by ID
app.get('/getProductDetails/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  } catch (err) {
    res.status(500).send("Error fetching product: " + err.message);
  }
});

// Get Product by ID (for edit page)
app.get('/products/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching product: " + err.message });
  }
});

// Update Product by ID
app.put('/products/:id', async (req, res) => {
  try {
    const { name, description, startingPrice, imageUrl, latitude, longitude, endTime } = req.body;

    // Validate fields as in addProduct
    if (!name || !description || !startingPrice || !imageUrl || !latitude || !longitude || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, description, startingPrice, imageUrl, latitude, longitude, and endTime'
      });
    }
    if (isNaN(startingPrice) || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'startingPrice, latitude, and longitude must be valid numbers'
      });
    }
    const endDate = new Date(endTime);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end time format'
      });
    }
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90 degrees'
      });
    }
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180 degrees'
      });
    }

    const updated = await ProductModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        startingPrice,
        imageUrl,
        latitude,
        longitude,
        endTime: endDate
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating product: " + err.message });
  }
});

// ====================================
// BID ROUTES
// ====================================

// Add Bid
app.post('/addBid', async (req, res) => {
  try {
    const { productId, bidAmount, bidderName, userId } = req.body;

    if (!userId || !productId || !bidAmount || bidAmount <= 0) {
      return res.status(400).send("Invalid bid data");
    }

    const newBid = new BidModel({ productId, userId, bidderName, bidAmount });
    await newBid.save();

    res.status(201).json(newBid);
  } catch (err) {
    res.status(500).send("Error placing bid: " + err.message);
  }
});

// Get Bids for a Product
app.get('/getBids/:productId', async (req, res) => {
  try {
    const bids = await BidModel.find({ productId: req.params.productId })
      .sort({ bidTime: -1 })
      .populate('userId', 'fullName email');

    res.json(bids);
  } catch (err) {
    res.status(500).send("Error fetching bids: " + err.message);
  }
});


// ====================================
// DASHBOARD STATS ROUTES
// ====================================

// Get Dashboard Statistics
app.get('/dashboard/stats', async (req, res) => {
  try {
    // Get total users
    const totalUsers = await UserModel.countDocuments();
    
    // Get active auctions (where endTime is in the future)
    const activeAuctions = await ProductModel.countDocuments({
      endTime: { $gt: new Date() }
    });
    
    // Get total bids
    const totalBids = await BidModel.countDocuments();
    
    // Get total revenue (sum of all bid amounts)
    const bids = await BidModel.find();
    const totalRevenue = bids.reduce((sum, bid) => sum + (bid.bidAmount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeAuctions,
        totalBids,
        totalRevenue
      }
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: err.message
    });
  }
});

// ====================================
// SERVER START
// ====================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
