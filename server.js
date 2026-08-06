import "dotenv/config"; //Importiert Umgebungsvariabeln aus .env Datei
import express from "express"; //Importiert Express Framework
import mongoose from "mongoose"; //Importiert Mongoose ODM Framework
import { MongoClient, ServerApiVersion } from "mongodb"; //Importiert Komponenten aus mongodb npm package, welche in diesem Projekt genutzt werden
import cors from "cors"; //Importiert Cors. Cors wird genutzt um Anfrangen über Domains hinweg zu ermöglichen.
import product from "./models/product.js"; //Importiert Product-Modell
import user from "./models/user.js"; // Importiert User-Modell
import order from "./models/order.js"; // Importiert Bestellung-Modell
import jwt from "jsonwebtoken"; //Importiert JWT für Session-Tokens
import bcrypt from "bcrypt"; //Importiert Bcrypt welches für den Passwortvergleich beim Login benötigt wird

const app = express(); //Konstante für Express App
const port = process.env.PORT || 3000; //Konstante für Port. Nutzt Port der Umgebung und defaultet sonst auf 3000
const uri = process.env.MONGODB_URI; //Speichert Umgebungsvariable aus .env Datei in Konstante

mongoose
  .connect(uri) //Verbindung zur Datenbank wird hergestellt
  .then(() => console.log("Mit MongoDB verbunden.")) //Meldung für erfolgreiche Verbindung
  .catch((error) => console.error("Fehler beim Verbinden mit MongoDB:", error)); //Meldung für fehlgeschlagene Verbindung

app.use(cors()); //Cors wird genutzt um Anfragen von jeder Domain in der Express App zu erlauben. Für Entwicklungs-Zwecke. Würde man produktiv nicht so machen.
app.use(express.json()); //Express.JSON ermöglicht das verarbeiten von einkommenden JSON Request Bodies

app.get("/", (req, res) => {
  //Wenn jemand eine Request auf "/" macht...
  res.json({ message: "Server läuft korrekt." }); //...schick diese Nachricht zurück
});

app.listen(port, () => {
  //Achtet auf einkommende HTTP Connections auf diesem Port...
  console.log(`Beispiel-App läuft auf http://localhost:${port}`); //...und schickt diese Nachricht einmalig, beim Serverstart. Fungiert essenziell als unser Test ob der Server läuft.
});

app.get(`/api/products`, async (req, res) => {
  //Zieht alle dokumente von der "products" Mongoose Collection
  try {
    const products = await product.find(); //Wartet bis DB-Abfrage durchgeführt wurde, damit alle Produkte in Konstante gespeichert werden.
    res.json(products); //Gibt Antworten der DB Anfrage zurück an das Frontend
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden der Daten!" }); //Gibt bei Problemen eine Fehlermeldung aus
  }
});

//GET Routehandler für Suchen von Produkten
app.get(`/api/products/search`, async (req, res) => {
  try {
    const searchTerm = req.query.name;

    //Prüft ob Suchtext leer ist und retourniert in diesem Fall alle Produkte
    if (!searchTerm || searchTerm.trim() === "") {
      const allProducts = await product.find();
      return res.json(allProducts);
    }

    //Sucht Dokumente in "products" Mongoose Collection die Such-text entsprechen
    const results = await product.find({
      productName: { $regex: searchTerm, $options: "i" },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Fehler bei der Suche!" });
  }
});

app.get(`/api/products/:id`, async (req, res) => {
  //Zieht ein Dokument von der "products" Mongoose Collection basierend auf der id
  try {
    const oneProduct = await product.findById(req.params.id);
    if (!oneProduct) {
      //Falls Produkt-ID nicht gefunden wurde, wird Fehlermeldung ausgegeben
      return res.status(404).json({ error: "Produkt nicht gefunden!" });
    }
    res.json(oneProduct);
  } catch (error) {
    //Falls Serverseitig etwas schiefläuft, wird eine Fehlermeldung ausgegeben
    res.status(500).json({ error: "Fehler beim Laden des Produkts!" });
  }
});

app.post(`/api/users`, async (req, res) => {
  try {
    //Erstellt ein Dokument in der "users" MongoDB Collection
    const newUser = await user.create(req.body);
    //Gibt Statuscode für erfolgreiche Erstellung und Daten des Nutzers zurück
    res.status(201).json(newUser);
  } catch (error) {
    //Falls User eingabe macht, die nicht mit dem Schema übereinstimmt, wird Statuscode für fehlende/falsche Angaben ausgegeben und Fehlermeldung was nicht stimmt
    res.status(400).json({ error: error.message });
  }
});

//PUT Route handler für Anpassungen an Nutzern
app.put(`/api/users/:id`, async (req, res) => {
  try {
    //Selektiert User anhand ID und übergibt aktualisierte Werte and DB. Aktualisierte Werte werden in Konstante gespeichert.
    const updatedUser = await user.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //Übergibt das aktualisierte Dokument
      runValidators: true, //Validiert ob Werte mit Schema übereinstimmen
    });
    //Prüft ob User gefunden wurde..
    if (!updatedUser) {
      //..und gibt entsprechenden Error aus
      return res.status(404).json({ error: "Nutzer nicht gefunden!" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//DELETE Route handler für Löschen von Nutzern
app.delete(`/api/users/:id`, async (req, res) => {
  try {
    const deletedUser = await user.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Nutzer nicht gefunden!" });
    }
    //Löscht alle Bestellungen, die mit diesem Nutzer verknüpft sind
    await order.deleteMany({ user: req.params.id });
    res.status(200).json({ message: "Nutzer und zugehörige Bestellungen erfolgreich gelöscht." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Löschen des Nutzers!" });
  }
});

//POST Route handler für Login
app.post(`/api/login`, async (req, res) => {
  try {
    //Zieht mittels destructuring das Passwort und den Benutzernamen aus dem Request Body
    const { userName, password } = req.body;

    //Sucht User anhand Username
    const foundUser = await user.findOne({ userName });
    if (!foundUser) {
      return (
        res
          //Statuscode für "Unautherized". Kann genutzt werden wenn Credentials falsch sind oder fehlen
          .status(401)
          .json({ error: "Ungültiger Username oder Passwort!" })
      );
    }

    //Eingegebens Passwort wird gehasht und mit hinterlegtem, gehashten Passwort verglichen
    const passwordMatches = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ error: "Ungültiger Username oder Passwort!" });
    }

    //Erstellt Token. _id des Users wurde als Payload definiert. Token wird mit Schlüssel aus .env signiert
    const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
      //Token ist gültig für 1 Tag
      expiresIn: "1d",
    });

    //Schickt Token, _id des Users und Usernamen an Frontend
    res.json({
      token,
      user: { id: foundUser._id, userName: foundUser.userName },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Login!" });
  }
});

//GET Routehandler um alle Bestellung eines Nutzers abzurufen
app.get(`/api/users/:id/orders`, async (req, res) => {
  try {
    const userId = req.params.id;

    //Zieht alle Bestellungen die unter dieser User Id getätigt wurden
    const userOrders = await order.find({ user: userId }).populate("product");

    res.json(userOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Laden der Benutzerbestellungen!" });
  }
});

//POST Route handler für neue Bestellungen
app.post(`/api/orders`, async (req, res) => {
  try {
    //Erstellt ein Dokument in der "orders" MongoDB Collection
    const newOrder = await order.create(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//PUT Route handler für Anpassungen an Bestellungen
app.put(`/api/orders/:id`, async (req, res) => {
  try {
    const updatedOrder = await order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: "Bestellung nicht gefunden!" });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//DELETE Route handler für Stornieren von Bestellungen
app.delete(`/api/orders/:id`, async (req, res) => {
  try {
    const deletedOrder = await order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Bestellung nicht gefunden!" });
    }
    res.status(200).json({ message: "Bestellung erfolgreich storniert." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Stornieren der Bestellung!" });
  }
});
