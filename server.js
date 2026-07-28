import "dotenv/config"; //Importiert Umgebungsvariabeln aus .env Datei
import express from "express"; //Importiert Express Framework
import mongoose from "mongoose"; //Importiert Mongoose ODM Framework
import { MongoClient, ServerApiVersion } from "mongodb"; //Importiert Komponenten aus mongodb npm package, welche in diesem Projekt genutzt werden
import cors from "cors"; //Importiert Cors. Cors wird genutzt um Anfrangen über Domains hinweg zu ermöglichen.
import product from "./models/product.js"; //Importiert Product-Modell

const app = express(); //Konstante für Express App
const port = process.env.PORT || 3000; //Konstante für Port. Nutzt Port der Umgebung und defaultet sonst auf 3000
const uri = process.env.MONGODB_URI; //Speichert Umgebungsvariable aus .env Datei in Konstante

mongoose
  .connect(uri) //Verbindung zur Datenbank wird hergestellt
  .then(() => console.log("Mit MongoDB verbunden.")) //Meldung für erfolgreiche Verbindung
  .catch((error) => console.error("Fehler beim Verbinden mit MongoDB:", error)); //Meldung für fehlgeschlagene Verbindung

// Erstellt ein Objekt der Klasse "MongoClient", welches später für einen Verbindungstest genutzt wird
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1, //Nutzt Stable-Version der API
    strict: true, //Lässt nur Commands zu, welche offizieller Bestandteil des Stable-Sets sind
    deprecationErrors: true, //Wenn Commands des Stable-Sets genutzt werden, welche als depreaceated markiert sind, wird ein Error anstatt eine Warnung geworfen
  },
});

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

app.get(`/api/produkte`, async (req, res) => {
  //Zieht alle dokumente von der "produkte" Mongoose Collection
  try {
    const produkte = await product.find(); //Wartet bis DB-Abfrage durchgeführt wurde, damit alle Produkte in Konstante gespeichert werden.
    res.json(produkte); //Antwortet mit den von der DB abgerufenen Produkten
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden der Daten!" }); //Gibt bei Problemen eine Fehlermeldung aus
  }
});
