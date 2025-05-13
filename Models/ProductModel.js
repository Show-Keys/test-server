import mongoose from 'mongoose';

const ProductSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startingPrice: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  endTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ProductModel = mongoose.model('Products', ProductSchema);
export default ProductModel;
