import React from "react";
import { PartsList } from "./components/PartsList";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu", minHeight: "100vh", background: "#f9fafb" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 24px" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111827" }}>🧩 PartFlow</h1>
        <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#6b7280" }}>跨平台零件管理系统 · Web 管理端</p>
      </header>
      <main>
        <PartsList />
      </main>
    </div>
  );
}


