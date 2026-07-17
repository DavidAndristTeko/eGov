import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/user.js";
import Product from "./models/product.js";
import Order from "./models/order.js";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Keine MongoDB-URI gefunden. MONGODB_URI muss in der .env-Datei korrekt vorhanden sein.");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Verbindung zur Datenbank hergestellt.");

    await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);

    const users = await User.create([
      {
        userId: 1001,
        firstname: "Anna",
        lastname: "Müller",
        userName: "annamueller",
        password: "passwort123",
        userActive: true,
      },
      {
        userId: 1002,
        firstname: "Ben",
        lastname: "Schmidt",
        userName: "benschmidt",
        password: "passwort456",
        userActive: true,
      },
    ]);

    const products = await Product.create([
      {
        productId: 2001,
        productName: "Laptop",
        description: "Leistungsstarker Business-Laptop",
        productActive: true,
        price: 999,
      },
      {
        productId: 2002,
        productName: "Monitor",
        description: "27-Zoll UltraWide-Monitor",
        productActive: true,
        price: 349,
      },
    ]);

    await Order.create([
      {
        orderId: 3001,
        product: products[0]._id,
        user: users[0]._id,
        orderDate: new Date(),
        orderStatus: 1,
      },
      {
        orderId: 3002,
        product: products[1]._id,
        user: users[1]._id,
        orderDate: new Date(),
        orderStatus: 2,
      },
      {
        orderId: 3003,
        product: products[0]._id,
        user: users[1]._id,
        orderDate: new Date(),
        orderStatus: 3,
      },
    ]);

    console.log("Seed-Daten erfolgreich angelegt.");
  } catch (error) {
    console.error("Fehler beim Seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Datenbankverbindung getrennt.");
  }
}

seed();
