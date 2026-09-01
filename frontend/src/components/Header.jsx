import { Link, useNavigate } from "react-router-dom"; // import react router für nav
import useStore from "../store/useStore";

export default function Header() {
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const token = useStore((s) => s.token);
  const handleLogout = () => {
    // wenn der User auf Logout klickt
    logout(); // aufruf von logout(), das löscht den login status
    navigate("/login", { replace: true }); // navigiert zu Login Seite, replace true um nicht auf eingeloggte seite zurückgehen zu können
  };

  return (
    <header className="border-b border-[#878d92]/40 bg-[#e3e3cd]">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6 flex-wrap">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-[#b42f32] transition-colors hover:text-[#8f2528]"
          >
            eGov
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-[#49494d] transition-colors hover:text-[#b42f32]"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-[#49494d] transition-colors hover:text-[#b42f32]"
          >
            Produkte
          </Link>
          <Link
            to="/orders"
            className="text-sm font-medium text-[#49494d] transition-colors hover:text-[#b42f32]"
          >
            Meine Bestellungen
          </Link>
          {token && (
            <Link
              to="/account"
              className="text-sm font-medium text-[#49494d] transition-colors hover:text-[#b42f32]"
            >
              Mein Konto
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!token && (
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-[#49494d] transition-colors hover:text-[#b42f32]"
            >
              Registrieren
            </Link>
          )}
          {token ? (
            <button
              onClick={handleLogout}
              className="rounded-sm bg-[#49494d] px-4 py-2 text-sm font-semibold text-[#e3e3cd] transition-colors hover:bg-[#b42f32]"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-sm bg-[#b42f32] px-4 py-2 text-sm font-semibold text-[#e3e3cd] transition-colors hover:bg-[#8f2528]"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
