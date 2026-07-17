import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
  OrderId: { type: Number, required: true },
  ProductName: { type: String, required: [true, "Vorname fehlt"] },
  UserName: { type: String, required: [true, "Username fehlt"] },
  OrderDate: { type: Date, required: [true, "Bestellungsdatum fehlt"] },
  OrderStatus: { type: Number, required: true, default: 1 },
});

const order = mongoose.model("Order", orderSchema);
export default order;
