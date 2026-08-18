/*
Sehr simpler auth
Token: Wenn User erfolgreich eingeloggt ist, schickt das Backend den Token zurück (lange kryptische Zeichenkette).
Dieser Code (Token) wird im Browser Speicher (local Storage) gespeichert.
Stand jetzt: Hier wird nur überprüft ob token vorhanden ist oder nicht (String oder null)
KI empfiehlt den Token in HttpOnly Cookies zu speichern wegen XSS-Angriffe (Cross-Site Scripting), fürs Schulprojekt lasse ich es jedoch so.
*/
export function setToken(token) {
  // wenn man sich einloggt wird hier der token im Browser Speicher gespeichert
  try {
    localStorage.setItem("token", token);
  } catch (e) {} // Wenn ein Fehler passiert wird dieser damit hier ignoriert, ergebnis: kein token vorhanden, routing auf login seite.
}

export function getToken() {
  // Token auslesen
  try {
    return localStorage.getItem("token");
  } catch (e) {
    return null; // Wenn kein Token existiert wird null zurückgegeben
  }
}

export function clearToken() {
  // Token löschen bei Logout
  try {
    localStorage.removeItem("token");
  } catch (e) {}
}

export function isAuthenticated() {
  return !!getToken(); // !!null = false, bedeutet nicht authentifiziert
}

export function logout() {
  try {
    localStorage.removeItem("token");
  } catch (e) {}
  // optionally inform backend to clear server-side session
}
