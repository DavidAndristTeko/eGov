import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-8 mt-12 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-3">eGov</h3>
            <p className="text-slate-400 text-sm">
              Eine moderne E-Government Lösung
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navigation</h4>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>
                <a href="/" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="hover:text-white transition">
                  Produkte
                </a>
              </li>
              <li>
                <a href="/orders" className="hover:text-white transition">
                  Bestellungen
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Info</h4>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  Datenschutz
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Impressum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-6 text-center text-slate-400 text-sm">
          <p>
            © {new Date().getFullYear()} eGov Demo. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
