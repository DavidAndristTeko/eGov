// Simple auth helper using localStorage. Swap for secure cookie approach in production.
export function setToken(token) {
  try {
    localStorage.setItem("token", token);
  } catch (e) {}
}

export function getToken() {
  try {
    return localStorage.getItem("token");
  } catch (e) {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("token");
  } catch (e) {}
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  try {
    localStorage.removeItem("token");
  } catch (e) {}
  // optionally inform backend to clear server-side session
}
