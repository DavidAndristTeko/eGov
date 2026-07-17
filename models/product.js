import mongoose, { Schema } from "mongoose";

const productschema = new Schema({
  productNumber: { type: Number, required: true },
  title: { type: String, required: [true, "Titel fehlt"] },
  description: String,
  active: { type: Boolean, required: true, default: true },
  price: { min: 0, max: 9999, type: Number, default: 0 },
});

const product = mongoose.model("Product", productschema);
export default product;
