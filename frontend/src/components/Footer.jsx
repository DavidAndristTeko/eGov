import React from "react";

export default function Footer() {
  return (
    // mit tailwind klassen
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
        <p className="text-sm text-[#e3e3cd]">David Andrist & Maëlle Esch</p>
      </div>
    </footer>
  );
}
