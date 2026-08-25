import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-[#b42f32] bg-[#49494d] text-[#e3e3cd]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">eGov</h3>
          </div>
          <p className="mt-1 text-sm text-[#878d92]">
            Eine moderne E-Government Lösung
          </p>
        </div>
        <nav aria-label="Footer-Navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#e3e3cd]">
            <li>
              <a
                href="/"
                className="transition-colors hover:text-[#df6747] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#df6747]"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/products"
                className="transition-colors hover:text-[#df6747] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#df6747]"
              >
                Produkte
              </a>
            </li>
            <li>
              <a
                href="/orders"
                className="transition-colors hover:text-[#df6747] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#df6747]"
              >
                Bestellungen
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
