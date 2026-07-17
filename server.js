import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";
import product from "./models/product.js";

const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Beispiel-App läuft auf http://localhost:${port}`);
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
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
