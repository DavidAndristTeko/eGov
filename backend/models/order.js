//Schema Klasse wird importiert, damit man später im Code einfach "Schema" schreiben kann anstatt "mongoose.Schema"
import mongoose, { Schema } from "mongoose";

//Schema wird definiert und in Konstante abgefüllt
const orderSchema = new Schema({
  orderId: { type: Number, required: true, unique: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderDate: {
    type: Date,
    required: [true, "Bestellungsdatum fehlt"],
    default: Date.now,
  },
  orderStatus: { type: Number, required: true, enum: [1, 2, 3], default: 1 },
});

//Schema wird als Model registriert
const order = mongoose.model("Order", orderSchema);
//Stellt dieses Modell zur Verfügung, damit es in anderen Files importiert werden kann
export default order;
