import mongoose from 'mongoose';

const BidSchema = mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  bidderName: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  bidTime: { type: Date, default: Date.now },
});

const BidModel = mongoose.model('Bids', BidSchema);
export default BidModel;
