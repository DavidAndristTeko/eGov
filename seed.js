//Importiert Umgebungsvariabeln aus .env Datei
import "dotenv/config";
//Importiert Mongoose ODM Framework
import mongoose from "mongoose";
//Importiert Product-Modell
import product from "./models/product.js";
// Importiert User-Modell
import user from "./models/user.js";
// Importiert Bestellung-Modell
import order from "./models/order.js";

//Speichert Umgebungsvariable für MongoDB-URI aus .env Datei in Konstante
const uri = process.env.MONGODB_URI;

//Prüft ob Konstante undefined ist, gibt error aus, falls dies der Fall ist und Beendet das node.js programm
if (!uri) {
  console.error(
    "Keine MongoDB-URI gefunden. MONGODB_URI muss in der .env-Datei korrekt vorhanden sein.",
  );
  process.exit(1);
}

async function seed() {
  try {
    //Versucht Verbindung zur db herzustellen,...
    await mongoose.connect(uri);
    console.log("Verbindung zur Datenbank hergestellt.");

    //...bereits vorhandene Testdaten in der db zu löschen,...
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);

    //...neue Testdaten zu erstellen...
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

    //...gibt aus, ob erfolgreich oder nicht. Zuletzt wird die Db-Verbindung getrennt.
    console.log("Seed-Daten erfolgreich angelegt.");
  } catch (error) {
    console.error("Fehler beim Seeding:", error);
  } finally {
    //Folgendes wird ausgeführt, unabhängig ob Try erfolgreich war

    //Es wird gewartet bis Verbindung zur DB geschlossen wurde
    await mongoose.disconnect();
    //Meldung wird ausgegeben
    console.log("Datenbankverbindung getrennt.");
  }
}

//Funktion wird ausgeführt
seed();
