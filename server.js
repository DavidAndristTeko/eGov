import "dotenv/config"; //Importiert MongoDB URL aus .env Datei
import express from "express"; //Importiert Express Framework
import mongoose from "mongoose"; //Importiert Mongoose ODM Framework
import { MongoClient, ServerApiVersion } from "mongodb"; //Importiert Komponenten aus mongodb npm package, welche in diesem Projekt genutzt werden
import cors from "cors"; //Importiert Cors. Cors wird genutzt um Anfrangen über Domains hinweg zu ermöglichen.
import product from "./models/product.js"; //Importiert Product-Modell

const app = express(); //Konstante für Express App
const port = process.env.PORT || 3000; //Konstante für Port. Nutzt Port der Umgebung und defaultet sonst auf 3000

app.use(cors()); //Cors wird genutzt um Anfragen von jeder Domain in der Express App zu erlauben. Für Entwicklungs-Zwecke. Würde man produktiv nicht so machen.
app.use(express.json()); //Express.JSON ermöglicht das verarbeiten von einkommenden JSON Request Bodies

app.get("/", (req, res) => {
  //Wenn jemand eine Request auf "/" macht...
  res.json({ message: "Server läuft korrekt." }); //...schick diese Nachricht zurück
});

app.listen(port, () => {
  //Achtet auf einkommende HTTP Connections auf diesem Port...
  console.log(`Beispiel-App läuft auf http://localhost:${port}`); //...und schickt diese Nachricht einmalig, wenn etwas eintrifft. Fungiert essenziell als unser Test ob der Server läuft.
});

app.get(`/api/produkte`, async (req, res) => {
  try {
    const produkte = await product.find();
    res.json(produkte);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden der Daten!" });
  }
});

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
