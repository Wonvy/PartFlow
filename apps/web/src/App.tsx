import React, { useState } from "react";
import { PartsList } from "./components/PartsList";
import { CategoriesManager } from "./components/CategoriesManager";
import { LocationsManager } from "./components/LocationsManager";

type Page = "parts" | "categories" | "locations";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("parts");

  const renderPage = () => {
    switch (currentPage) {
      case "parts":
        return <PartsList />;
      case "categories":
        return <CategoriesManager />;
      case "locations":
        return <LocationsManager />;
      default:
        return <PartsList />;
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu", minHeight: "100vh", background: "#f9fafb" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 24px" }}>
        <h1 style={{ margin: "0 0 12px 0", fontSize: 24, fontWeight: 700, color: "#111827" }}>🧩 PartFlow</h1>
        <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#6b7280" }}>跨平台零件管理系统 · Web 管理端</p>
        
        <nav style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setCurrentPage("parts")}
            style={{
              padding: "8px 16px",
              background: currentPage === "parts" ? "#2563eb" : "white",
              color: currentPage === "parts" ? "white" : "#6b7280",
              border: "1px solid #e5e7eb",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500
            }}
          >
            📦 零件管理
          </button>
          <button
            onClick={() => setCurrentPage("categories")}
            style={{
              padding: "8px 16px",
              background: currentPage === "categories" ? "#2563eb" : "white",
              color: currentPage === "categories" ? "white" : "#6b7280",
              border: "1px solid #e5e7eb",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500
            }}
          >
            📂 分类管理
          </button>
          <button
            onClick={() => setCurrentPage("locations")}
            style={{
              padding: "8px 16px",
              background: currentPage === "locations" ? "#2563eb" : "white",
              color: currentPage === "locations" ? "white" : "#6b7280",
              border: "1px solid #e5e7eb",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500
            }}
          >
            📍 位置管理
          </button>
        </nav>
      </header>
      <main>
        {renderPage()}
      </main>
    </div>
  );
}


