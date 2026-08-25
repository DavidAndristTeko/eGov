//Schema Klasse wird importiert, damit man später im Code einsch "Schema" schreiben kann anstatt "mongoose.Schema"
import mongoose, { Schema } from "mongoose";

//Schema wird definiert und in Konstante abgefüllt
const productSchema = new Schema({
  productId: { type: Number, required: true, unique: true },
  productName: { type: String, required: [true, "Titel fehlt"], trim: true },
  description: String, //Optionale Produktbeschreibung
  productActive: { type: Boolean, required: true, default: true },
  price: { min: 0, max: 9999, type: Number, default: 0 },
});

//Schema wird als Model registriert
const product = mongoose.model("Product", productSchema);
//Stellt dieses Modell zur Verfügung, damit es in anderen Files importiert werden kann
export default product;
