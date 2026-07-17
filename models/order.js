import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
  orderId: { type: Number, required: true, unique: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderDate: { type: Date, required: [true, "Bestellungsdatum fehlt"], default: Date.now },
  orderStatus: { type: Number, required: true, enum: [1, 2, 3], default: 1 },
});

const order = mongoose.model("Order", orderSchema);
export default order;
