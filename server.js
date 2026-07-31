import "dotenv/config"; //Importiert Umgebungsvariabeln aus .env Datei
import express from "express"; //Importiert Express Framework
import mongoose from "mongoose"; //Importiert Mongoose ODM Framework
import { MongoClient, ServerApiVersion } from "mongodb"; //Importiert Komponenten aus mongodb npm package, welche in diesem Projekt genutzt werden
import cors from "cors"; //Importiert Cors. Cors wird genutzt um Anfrangen über Domains hinweg zu ermöglichen.
import product from "./models/product.js"; //Importiert Product-Modell
import user from "./models/user.js"; // Importiert User-Modell
import order from "./models/order.js"; // Importiert Bestellung-Modell

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
    res.json(products); //Antwortet mit den von der DB abgerufenen Produkten
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden der Daten!" }); //Gibt bei Problemen eine Fehlermeldung aus
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
    res.json(updatedUser); //Aktualisierte Werte werden zurück ans Frontend geschickt.
    //Falls es einen Error gibt..
  } catch (error) {
    //..liegt dies höchstwahrscheinlich dran, dass Angaben nicht mit Schema übereinstimmen. User wird entsprechender Error ausgegeben.
    res.status(400).json({ error: error.message });
  }
});
