import mongoose, { Schema } from "mongoose";

const productschema = new Schema({
  title: { type: String, required: [true, "Titel fehlt"] },
  description: String,
  active: { type: Boolean, default: true },
  price: { max: 9999, type: Number },
});

const product = mongoose.model("Product", productschema);
export default product;
