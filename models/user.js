import mongoose, { Schema } from "mongoose"; //Schema Klasse wird importiert, damit man später im Code einsch "Schema" schreiben kann anstatt "mongoose.Schema"

//Schema wird definiert
const userSchema = new Schema({
  userId: { type: Number, required: true, unique: true }, //ID des Users
  firstname: {
    type: String,
    required: [true, "Vorname fehlt"],
    trim: true,
    minLength: 2,
    maxLength: 50,
    match: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
  },
  lastname: {
    type: String,
    required: [true, "Nachname fehlt"],
    trim: true,
    minLength: 2,
    maxLength: 50,
    match: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
  },
  userName: {
    type: String,
    required: [true, "Username fehlt"],
    trim: true,
    minLength: 2,
    maxLength: 50,
    match: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
  },
  password: {
    type: String,
    required: [true, "Passwort fehlt"],
    trim: true,
    minLength: 8,
  },
  userActive: { type: Boolean, required: true, default: true },
});

const user = mongoose.model("User", userSchema); //Schema wird als Model registriert
export default user; //Stellt dieses Modell zur Verfügung, damit es in anderen Files importiert werden kann
