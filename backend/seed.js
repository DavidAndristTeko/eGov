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
      //Es werden 3 Produkte generiert, die zum eGov Konzept passen und individuelle Bestellformulare haben
      {
        productId: 2001,
        productName: "Gesuch für Wildtierhaltungsbewilligung",
        description:
          "Antrag zur Bewilligung der Haltung exotischer Tiere gemäss kantonaler Tierschutzverordnung.",
        productActive: true,
        price: 150,
      },
      {
        productId: 2002,
        productName: "Gesuch für Lernfahrausweis",
        description:
          "Antrag zur Ausstellung eines Lernfahrausweises für die Kategorie B.",
        productActive: true,
        price: 75,
      },
      {
        productId: 2003,
        productName: "Baugesuch",
        description:
          "Antrag zur Bewilligung eines Bauvorhabens auf privatem Grundstück.",
        productActive: true,
        price: 400,
      },
      //Zusätzlich werden 9 "Filler-Produkte" generiert, mit denen wir Such-/Filterfunktionen testen können
      {
        productId: 2004,
        productName: "Laptop",
        description: "Leistungsstarker Business-Laptop",
        productActive: true,
        price: 999,
      },
      {
        productId: 2005,
        productName: "Monitor",
        description: "27-Zoll UltraWide-Monitor",
        productActive: true,
        price: 349,
      },
      {
        productId: 2006,
        productName: "Tastatur",
        description: "Mechanische Tastatur mit RGB-Beleuchtung",
        productActive: true,
        price: 89,
      },
      {
        productId: 2007,
        productName: "Maus",
        description: "Kabellose ergonomische Maus",
        productActive: true,
        price: 45,
      },
      {
        productId: 2008,
        productName: "Kopfhörer",
        description: "Noise-Cancelling Over-Ear Kopfhörer",
        productActive: true,
        price: 199,
      },
      {
        productId: 2009,
        productName: "Webcam",
        description: "Full-HD Webcam mit Autofokus",
        productActive: true,
        price: 59,
      },
      {
        productId: 2010,
        productName: "Drucker",
        description: "Kompakter Tintenstrahldrucker für den Heimgebrauch",
        productActive: true,
        price: 129,
      },
      {
        productId: 2011,
        productName: "Externe Festplatte",
        description: "2TB USB-C Festplatte",
        productActive: true,
        price: 79,
      },
      {
        productId: 2012,
        productName: "USB-Hub",
        description: "7-Port USB 3.0 Hub",
        productActive: true,
        price: 25,
      },
    ]);

    await Order.create([
      {
        orderId: 3001,
        product: products[0]._id, //Wildtierhaltungsbewilligung
        user: users[0]._id,
        orderDate: new Date(),
        orderStatus: 1,
      },
      {
        orderId: 3002,
        product: products[1]._id, //Lernfahrausweis
        user: users[1]._id,
        orderDate: new Date(),
        orderStatus: 2,
      },
      {
        orderId: 3003,
        product: products[2]._id, //Baugesuch
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
