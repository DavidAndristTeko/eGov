import "dotenv/config"; //Importiert Umgebungsvariabeln aus .env Datei
import express from "express"; //Importiert Express Framework
import mongoose from "mongoose"; //Importiert Mongoose ODM Framework
import cors from "cors"; //Importiert Cors, welches Anfragen über Domains und Ports hinweg erlaubt. Wird hier z. B. genutzt um Kommunikation zwischen Frontend und Backend zu ermöglichen.
import product from "./models/product.js"; //Importiert Product-Modell
import user from "./models/user.js"; // Importiert User-Modell
import order from "./models/order.js"; // Importiert Bestellung-Modell
import jwt from "jsonwebtoken"; //Importiert JWT für Session-Tokens. Sessions werden genutzt damit der User nach einem Login auf unserer Webseite eingeloggt bleibt.
import bcrypt from "bcrypt"; //Importiert Bcrypt welches für den Passwortvergleich beim Login benötigt wird

const app = express(); //Konstante für Express App
const port = process.env.PORT; //Speichert Umgebungsvariable für Port aus .env Datei in Konstante
const uri = process.env.MONGODB_URI; //Speichert Umgebungsvariable für MongoDB-URI aus .env Datei in Konstante

mongoose
  .connect(uri) //Verbindung zur Datenbank wird hergestellt
  .then(() => console.log("Mit MongoDB verbunden.")) //Meldung für erfolgreiche Verbindung
  .catch((error) => console.error("Fehler beim Verbinden mit MongoDB:", error)); //Meldung für fehlgeschlagene Verbindung

app.use(cors()); //Cors wird genutzt um Anfragen von jeder Domain in der Express App zu erlauben. Für Entwicklungs-Zwecke. Würde man produktiv nicht so machen.
app.use(express.json()); //Express.JSON ermöglicht das verarbeiten von einkommenden JSON Request Bodies

app.listen(port, () => {
  //Achtet auf einkommende HTTP Connections auf diesem Port...
  console.log(`Beispiel-App läuft auf http://localhost:${port}`); //...und schickt diese Nachricht einmalig, beim Serverstart. Fungiert essenziell als unser Test ob der Server läuft.
});

app.get("/", (req, res) => {
  //Wenn jemand eine Request auf "/" macht...
  res.json({ message: "Server läuft korrekt." }); //...schick diese Nachricht zurück
});

//GET all Routehandler für Anzeigen des gesamten Produktkatalogs
app.get(`/api/products`, async (req, res) => {
  //Zieht alle dokumente von der "products" Mongoose Collection
  try {
    const products = await product.find(); //Wartet bis DB-Abfrage durchgeführt wurde, damit alle Produkte in Konstante gespeichert werden.
    res.json(products); //Gibt Antworten der DB Anfrage zurück an das Frontend
  } catch (error) {
    //Status 500 steht für "Internal Server Error". Macht hier am meisten Sinn, da die Anfrage eigentlich nur fehlschlagen kann, wenn der Server ein Problem hat.
    res.status(500).json({ error: "Fehler beim Laden der Daten!" }); //Gibt bei Problemen eine Fehlermeldung aus
  }
});

//GET Routehandler für Suchen von Produkten
app.get(`/api/products/search`, async (req, res) => {
  try {
    const searchTerm = req.query.name; //Füllt Konstante mit Suchanfrage des Users ab

    //Prüft ob Suchtext leer ist. Retourniert alle Produkte wenn true.
    if (!searchTerm || searchTerm.trim() === "") {
      const allProducts = await product.find();
      return res.json(allProducts);
    }

    //Füllt das Resultat einer MongoDB Suche, anhand der User-Eingabe, in eine Konstante ab
    const results = await product.find({
      //Hierbei handelt es sich um MongoDB-Syntax
      $or: [
        { productName: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Fehler bei der Suche!" });
  }
});

//GET by ID Routehandler für das Abrufen einzelner Produkte
app.get(`/api/products/:id`, async (req, res) => {
  try {
    const oneProduct = await product.findById(req.params.id); //Füllt Resultat der Suche per ID in Konstante ab

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

//POST Routehandler für die Registration eines neuen Users
app.post(`/api/users`, async (req, res) => {
  try {
    const newUser = await user.create(req.body); //Erstellt ein Dokument in der "users" MongoDB Collection
    //Gibt Statuscode 201 zurück (Created successfully)
    res.status(201).json(newUser);
  } catch (error) {
    //Falls User eingabe macht, die nicht mit dem Schema übereinstimmt, wird Statuscode 400 für fehlende/falsche Angaben ausgegeben und Fehlermeldung was nicht stimmt
    res.status(400).json({ error: error.message });
  }
});

//PUT Route handler für Anpassungen an Nutzern
app.put(`/api/users/:id`, async (req, res) => {
  try {
    //Selektiert User anhand ID und übergibt aktualisierte Werte an DB. Aktualisierte Werte werden in Konstante gespeichert.
    const updatedUser = await user.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //Übergibt das aktualisierte Dokument
      runValidators: true, //Validiert ob Werte mit Schema übereinstimmen
    });

    //Prüft ob User gefunden wurde..
    if (!updatedUser) {
      //..und gibt sonst Statuscode 404 zurück (Objekt wurde nicht gefunden)
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
    //Statuscode 200 wird retourniert (Mutation erfolgreich durchgeführt)
    res.status(200).json({
      message: "Nutzer und zugehörige Bestellungen erfolgreich gelöscht.",
    });
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
      return res
        .status(401) //Statuscode für "Unautherized". Kann genutzt werden wenn Credentials falsch sind oder fehlen
        .json({ error: "Ungültiger Username oder Passwort!" });
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
