// axios: javascript bibliothek zum senden von HTTP anfragen zum serer
import axios from "axios";

// sagt wo der Server ist
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// erstellt client (user welcher wiedererkannt wird)
const api = axios.create({
  baseURL, // URL von oben
  headers: {
    //standardheader
    "Content-Type": "application/json",
  },
});

// interceptor: wie türsteher, der token von localstore automatisch dem header hinzugefügt wenn vorhanden
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token"); // holt token
      if (token) {
        // wenn token vorhanden
        config.headers = config.headers || {}; // stellt sicher das headers existiert oder erstellt sonst ein leeres objekt
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // fehler in localStorage ignorieren
    }
    return config; // sendet die anfrage weiter inkl token im header
  },
  (error) => Promise.reject(error), // leitet den fehler weiter falls einer vorhanden
);

api.interceptors.response.use(
  (res) => res, // wenn alles ok -> antwort weiter senden
  (error) => {
    if (error.response?.status === 401) {
      error.userMessage =
        "Ihre Sitzung ist abgelaufen oder nicht mehr gültig. Bitte melden Sie sich erneut an.";
      try {
        localStorage.removeItem("token");
      } catch (e) {}
    }
    return Promise.reject(error); // leitet den fehler weiter falls einer vorhanden
  },
);

export default api;
