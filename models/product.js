import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  productId: { type: Number, required: true, unique: true },
  productName: { type: String, required: [true, "Titel fehlt"], trim: true },
  description: String,
  productActive: { type: Boolean, required: true, default: true },
  price: { min: 0, max: 9999, type: Number, default: 0 },
});

const product = mongoose.model("Product", productSchema);
export default product;
