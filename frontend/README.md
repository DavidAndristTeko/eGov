# eGov Frontend

Kurzanleitung:

- Installieren:

```bash
cd eGov/frontend
npm install
```

- Entwickeln:

```bash
npm run dev
```

- Wichtige Umgebungsvariable (nutze `.env` in deinem lokalen Ordner, nicht committen):

```
VITE_API_BASE_URL=http://localhost:3000
```

Was im Git-Repo enthalten ist:

- Quellcode unter `src/` (Pages, Komponenten, API-Client)
- `package.json` mit Dependencies und Scripts
- `index.html`, `.gitignore`, `.env.example`, `README.md`

Was NICHT im Repo enthalten sein sollte:

- `node_modules/`, `dist/` und lokale `.env` Dateien
