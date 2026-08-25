//Importiert Umgebungsvariabeln aus .env Datei
import "dotenv/config";
//Importiert Express Framework
import express from "express";
//Importiert Mongoose ODM Framework
import mongoose from "mongoose";
/*Importiert Cors, welches Anfragen über Domains und Ports hinweg erlaubt. 
Wird hier z. B. genutzt um Kommunikation zwischen Frontend und Backend zu ermöglichen*/
import cors from "cors";
//Importiert Product-Modell
import product from "./models/product.js";
// Importiert User-Modell
import user from "./models/user.js";
// Importiert Bestellung-Modell
import order from "./models/order.js";
//Importiert JWT für Session-Tokens. Sessions werden genutzt damit der User nach einem Login auf unserer Webseite eingeloggt bleibt
import jwt from "jsonwebtoken";
//Importiert Bcrypt welches für den Passwortvergleich beim Login benötigt wird
import bcrypt from "bcrypt";

//Konstante um Express-App anzusprechen
const app = express();
//Speichert Umgebungsvariable für Port aus .env Datei in Konstante
const port = process.env.PORT;
//Speichert Umgebungsvariable für MongoDB-URI aus .env Datei in Konstante
const uri = process.env.MONGODB_URI;

mongoose
  //Verbindung zur Datenbank wird hergestellt
  .connect(uri)
  //Meldung für erfolgreiche Verbindung
  .then(() => console.log("Mit MongoDB verbunden."))
  //Meldung für user + Error der ausgelöst wurde, für uns zum troubleshooten
  .catch((error) => console.error("Fehler beim Verbinden mit MongoDB:", error));

//Cors wird genutzt. Da keine Parameter definiert, sind Anfragen von allen Domains erlaubt. In Kontext eines Schulprojekts sinnvoll.
app.use(cors());
//Express.JSON ermöglicht das verarbeiten von einkommenden JSON Request Bodies
app.use(express.json());

//Funktion wird definiert um bestimmte routen zu "schützen" bzw. sicherzustellen, dass nru eingeloggte User auf die Route zugreifen können.
function requireAuth(req, res, next) {
  //Füllt Konstante mit dem Wert des Headers "authorization" ab. Falls kein Wert wird Konstante mit leerem Wert abgefüllt.
  const authorization = req.headers.authorization || "";
  /*Füllt Konstante mit dem Token des Users ab. Header "authorization" sollte den Wert formatiert haben wie folgt "Bearer cjsaodijas..." 
  Also nach "Bearer" kommt das Token selber. Deshalb die if/else abfrage die prüft ob Wert mit "Bearer " startet und bei true alles ausser das Token entfernt.*/
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  //Falls User nicht eingeloggt ist, Zugriff verweigern und Fehlermeldung ausgeben.
  if (!token) {
    //Statuscode 401 steht für "Unautherized". Wird genutzt wenn Credentials falsch sind oder fehlen
    return res.status(401).json({ error: "Authentifizierung erforderlich." });
  }

  //Token des Users wird verifiziert und wenn erfolgreich, wird die ID des Users in "req" abgelegt, womit sie der nächsten Funktion zur Verfügung gestellt wird.
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    //Wenn jwt.verify keinen error wirft, zum nächsten Schritt gehen (in diesem Fall "requireOwnAccount")
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Ungültige oder abgelaufene Sitzung." });
  }
}

//Prüft ob User auf seine eigenen Daten oder die eines anderen Users zugreift
function requireOwnAccount(req, res, next) {
  //User ID welche von jwt.verify geprüft wurde, wir mit id in der Route verglichen, um sicherzustellen, dass user nur seine eigenen Daten bearbeitet
  if (String(req.userId) !== String(req.params.id)) {
    //Falls die beiden ids nicht übereinstimmen, Fehlermeldung ausgeben.
    return (
      res
        //Statuscode 403 steht für "authenticated, but not authorized for this action". Wird genutzt um User zu sagen, dass er für die gewünschte Route nicht berechtigt ist.
        .status(403)
        .json({ error: "Sie dürfen nur Ihr eigenes Konto verwalten." })
    );
  }
  next();
}

//Prüft ob Server läuft.
app.listen(port, () => {
  console.log(`Beispiel-App läuft auf http://localhost:${port}`);
});

//Wenn jemand eine Request auf "http://localhost:3000/" macht...
app.get("/", (req, res) => {
  //...wird diese Nachricht zurückgeschickt. Prüft ob Server Anfragen empfangen und darauf Antworten kann.
  res.json({ message: "Server läuft korrekt." });
});

//GET all Routehandler für Anzeigen des gesamten Produktkatalogs
app.get(`/api/products`, async (req, res) => {
  try {
    //Wartet bis DB-Abfrage durchgeführt wurde, damit alle Produkte in Konstante gespeichert werden.
    const products = await product.find({ productActive: true });
    //Gibt Antworten der DB Anfrage zurück an das Frontend
    res.json(products);
  } catch (error) {
    //Error wird in Konsole ausgegeben
    console.error(error);
    //Statuscode 500 steht für "Internal Server Error". Wird hier angewendet, da es praktisch nur serverseitig fehlschlagen kann.
    res.status(500).json({ error: "Fehler beim Laden der Daten!" });
  }
});

//GET Routehandler für Suchen von Produkten
app.get(`/api/products/search`, async (req, res) => {
  try {
    const { name, minPrice, maxPrice } = req.query;
    const filters = { productActive: true };
    const searchTerm = typeof name === "string" ? name.trim() : "";

    if (searchTerm) {
      const escapedSearchTerm = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      filters.$or = [
        { productName: { $regex: escapedSearchTerm, $options: "i" } },
        { description: { $regex: escapedSearchTerm, $options: "i" } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const minimum = minPrice === undefined ? 0 : Number(minPrice);
      const maximum =
        maxPrice === undefined ? Number.MAX_SAFE_INTEGER : Number(maxPrice);

      if (
        !Number.isFinite(minimum) ||
        !Number.isFinite(maximum) ||
        minimum < 0 ||
        maximum < 0 ||
        minimum > maximum
      ) {
        return res.status(400).json({ error: "Der Preisfilter ist ungültig." });
      }

      filters.price = { $gte: minimum, $lte: maximum };
    }

    const results = await product.find(filters).sort({ productName: 1 });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler bei der Suche!" });
  }
});

//GET by ID Routehandler für das Abrufen einzelner Produkte
app.get(`/api/products/:id`, async (req, res) => {
  try {
    //Füllt Resultat der Suche per ID in Konstante ab
    const oneProduct = await product.findOne({
      _id: req.params.id,
      productActive: true,
    });

    //Falls Produkt-ID nicht gefunden wurde, wird Fehlermeldung ausgegeben
    if (!oneProduct) {
      //Statuscode 404 steht für "Das angefragte Objekt konnte nicht gefunden werden"
      return res.status(404).json({ error: "Produkt nicht gefunden!" });
    }

    res.json(oneProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Laden des Produkts!" });
  }
});

//POST Routehandler für die Registration eines neuen Users
app.post(`/api/users`, async (req, res) => {
  try {
    //Erstellt ein Dokument in der "users" MongoDB Collection
    const newUser = await user.create(req.body);
    //Statuscode 201 steht für "Anfrage war erfolgreich und neue Ressource wurde erstellt"
    res.status(201).json(newUser);
  } catch (error) {
    //Prüfen ob Error auf Eingaben des Users zurückzuführen ist, z. B. wenn Eingaben nicht mit Schema übereinstimmen.
    if (error.name === "ValidationError") {
      /*Statuscode 400 steht für "Fehlende oder falsche Angaben". 
      Mit error.message wird der genaue Errortext ausgegeben, wo ersichtlich ist, welche Angabe nicht stimmt.*/
      res.status(400).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: "Fehler beim Erstellen des Nutzers!" });
    }
  }
});

//PUT Route handler für Anpassungen an Nutzern
app.put(`/api/users/:id`, requireAuth, requireOwnAccount, async (req, res) => {
  try {
    //Selektiert User anhand ID und übergibt aktualisierte Werte an DB. Aktualisierte Werte werden in Konstante gespeichert.
    const updatedUser = await user.findByIdAndUpdate(req.params.id, req.body, {
      //Übergibt das aktualisierte Dokument
      new: true,
      //Validiert ob Werte mit Schema übereinstimmen
      runValidators: true,
    });

    //Prüft ob Konstante undefined ist, was bedeuten würde, dass User nicht gefunden wurde.
    if (!updatedUser) {
      //Mit return wird aus der Funktion ausgetreten
      return res.status(404).json({ error: "Nutzer nicht gefunden!" });
    }

    res.json(updatedUser);
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: "Fehler beim Mutieren des Nutzers!" });
    }
  }
});

//DELETE Route handler für Löschen von Nutzern
app.delete(
  `/api/users/:id`,
  requireAuth,
  requireOwnAccount,
  async (req, res) => {
    try {
      //Selektiert User anhand ID und löscht diesen aus DB. Resultat wird in Konstante abgefüllt.
      const deletedUser = await user.findByIdAndDelete(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({ error: "Nutzer nicht gefunden!" });
      }

      //Löscht alle Bestellungen, die mit diesem Nutzer verknüpft sind
      await order.deleteMany({ user: req.params.id });
      //Statuscode 200 steht für "Anfrage war erfolgreich"
      res.status(200).json({
        message: "Nutzer und zugehörige Bestellungen erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Fehler beim Löschen des Nutzers!" });
    }
  },
);

//POST Route handler für Login
app.post(`/api/login`, async (req, res) => {
  try {
    //Zieht mittels destructuring das Passwort und den Benutzernamen aus dem Request Body und füllt diese in Konstante ab
    const { userName, password } = req.body;
    //Sucht User anhand Username und füllt Resultat in Konstante ab.
    const foundUser = await user.findOne({ userName });

    if (!foundUser) {
      return res
        .status(401)
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

    //Schickt Token und sichere Profildaten an Frontend
    res.json({
      token,
      user: {
        id: foundUser._id,
        firstname: foundUser.firstname,
        lastname: foundUser.lastname,
        userName: foundUser.userName,
        userActive: foundUser.userActive,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Login!" });
  }
});

//GET Routehandler um alle Bestellung eines Nutzers abzurufen
app.get(`/api/users/:id/orders`, async (req, res) => {
  try {
    //Id des Users wird abgerufen und in Konstante abgefüllt.
    const userId = req.params.id;

    //Zieht alle Bestellungen die unter dieser User Id getätigt wurden und füllt diese in Konstante ab.
    const userOrders = await order.find({ user: userId }).populate("product");

    res.json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Laden der Bestellungen!" });
  }
});

//POST Route handler für neue Bestellungen
app.post(`/api/orders`, async (req, res) => {
  try {
    const selectedProduct = await product.findOne({
      _id: req.body.product,
      productActive: true,
    });

    if (!selectedProduct) {
      return res
        .status(400)
        .json({ error: "Dieses Produkt ist nicht verfügbar." });
    }

    const newOrder = await order.create(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Aufgeben der Bestellung!" });
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
    console.error(error);
    res.status(500).json({ error: "Fehler beim Mutieren der Bestellung!" });
  }
});

//DELETE Route handler für Stornieren von Bestellungen (Soft-Delete)
app.delete(`/api/orders/:id`, async (req, res) => {
  try {
    const cancelledOrder = await order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: 3 },
      { new: true, runValidators: true },
    );

    if (!cancelledOrder) {
      return res.status(404).json({ error: "Bestellung nicht gefunden!" });
    }

    res.status(200).json({
      message: "Bestellung erfolgreich auf inaktiv gesetzt.",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Stornieren der Bestellung!" });
  }
});
