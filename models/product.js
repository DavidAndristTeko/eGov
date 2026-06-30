import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  title: { type: String, default: [true, "Titel fehlt"] },
  description: String,
  active: { type: Boolean, default: true },
  price: { max: 9999, type: Number },
});

const product = mongoose.model("product", productSchema);
export default Product;
