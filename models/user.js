import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  UserId: { type: Number, required: true },
  Firstname: { type: String, required: [true, "Vorname fehlt"] },
  Lastname: { type: String, required: [true, "Nachname fehlt"] },
  UserName: { type: String, required: [true, "Username fehlt"] },
  Password: { type: String, required: [true, "Passwort fehlt"] },
  active: { type: Boolean, required: true, default: true },
});

const user = mongoose.model("User", userSchema);
export default user;
