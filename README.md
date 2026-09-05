# eGov Frontend

React-Frontend der eGov-Anwendung. Die Anwendung verwendet Vite, React Router,
TanStack Query, Zustand und Tailwind CSS. Das Backend befindet sich im
Verzeichnis `../backend`.

## Voraussetzungen

- Node.js und npm
- Eine laufende MongoDB-Instanz für das Backend

## Installation und Entwicklung

Frontend und Backend werden in zwei separaten Terminals gestartet.

### Frontend

```bash
cd eGov/frontend
npm install
npm run dev
```

Vite stellt die Anwendung standardmäßig unter `http://localhost:5173` bereit.

### Backend

```bash
cd eGov/backend
npm install
npm run dev
```

Das Backend liest seine Konfiguration aus `eGov/backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/egov
JWT_SECRET=ein-lokales-geheimnis
```

Die Werte sind Beispiele. Das JWT-Geheimnis darf nicht veröffentlicht werden.

Für die lokale Frontend-Konfiguration kann optional `eGov/frontend/.env`
angelegt werden:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Ohne diese Variable verwendet der API-Client automatisch
`http://localhost:3000`.

## Testdaten

Das Seed-Skript löscht die vorhandenen Benutzer, Produkte und Bestellungen und
legt anschließend Beispieldaten an:

```bash
cd eGov/backend
npm run seed
```

Beispielbenutzer:

- Benutzername `annamueller`, Passwort `passwort123`
- Benutzername `benschmidt`, Passwort `passwort456`

Diese Zugangsdaten sind ausschließlich für die lokale Entwicklung gedacht.

## Verfügbare Frontend-Skripte

```bash
npm run dev      # Entwicklungsserver starten
npm run build    # Produktions-Build erstellen
npm run preview  # Produktions-Build lokal anzeigen
```

## Seiten und Funktionen

- `/` – Startseite
- `/products` – Produkte suchen und nach Preis filtern
- `/products/:id` – Produktdetails und Bestellung
- `/login` und `/register` – Anmeldung und Registrierung
- `/account` – eigenes Benutzerkonto verwalten
- `/orders` – eigene Bestellungen anzeigen und stornieren

Die Produkt-, Benutzer- und Bestellfunktionen kommunizieren über den API-Client
in `src/api/apiClient.js` mit dem Backend. Geschützte Seiten setzen eine gültige
Anmeldung voraus.

## Git- und Geheimnis-Hinweise

Nicht committen:

- `node_modules/`
- `dist/`
- `.env`, `.env.local` und andere lokale Umgebungsdateien

Diese Dateien sind im Frontend-`.gitignore` berücksichtigt. Das Backend benötigt
ebenfalls eine lokale `.env`-Datei, die nicht versioniert werden darf.
