import React, { useState, useRef } from "react";
import { PartsList } from "./components/PartsList";
import { CategoriesManager } from "./components/CategoriesManager";
import { LocationsManager } from "./components/LocationsManager";
import { DataManager } from "./components/DataManager";
import { colors, typography, spacing, borderRadius, shadows } from "./styles/design-system";

type Page = "parts" | "categories" | "locations" | "data";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("parts");
  const partsListRef = useRef<{ handleCreate: () => void }>(null);
  const categoriesRef = useRef<{ handleCreate: () => void }>(null);
  const locationsRef = useRef<{ handleCreate: () => void }>(null);

  const handleCreateNew = () => {
    switch (currentPage) {
      case "parts":
        if (partsListRef.current) {
          partsListRef.current.handleCreate();
        }
        break;
      case "categories":
        if (categoriesRef.current) {
          categoriesRef.current.handleCreate();
        }
        break;
      case "locations":
        if (locationsRef.current) {
          locationsRef.current.handleCreate();
        }
        break;
      case "data":
        // 数据页面没有创建功能
        break;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "parts":
        return <PartsList ref={partsListRef} />;
      case "categories":
        return <CategoriesManager ref={categoriesRef} />;
      case "locations":
        return <LocationsManager ref={locationsRef} />;
      case "data":
        return <DataManager />;
      default:
        return <PartsList ref={partsListRef} />;
    }
  };

  return (
    <div style={{ 
      fontFamily: typography.fontFamily.base, 
      minHeight: "100vh", 
      background: colors.background 
    }}>
      {/* 顶部导航栏 - 极简设计 */}
      <header style={{ 
        background: colors.surface,
        borderBottom: `1px solid ${colors.gray200}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255, 255, 255, 0.95)"
      }}>
        <div style={{ 
          maxWidth: "1400px", 
          margin: "0 auto", 
          padding: `${spacing['2xl']} ${spacing['3xl']}` 
        }}>
          {/* Logo 和标题 */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: spacing.xl
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: typography.fontSize['3xl'], 
                fontWeight: typography.fontWeight.bold, 
                color: colors.primary,
                letterSpacing: "-0.02em"
              }}>
                PartFlow
              </h1>
              <p style={{ 
                margin: `${spacing.xs} 0 0 0`, 
                fontSize: typography.fontSize.sm, 
                color: colors.gray600,
                fontWeight: typography.fontWeight.normal
              }}>
                零件管理系统
              </p>
            </div>
            
            {/* 新建按钮 - 在所有页面显示（除了数据页面） */}
            {currentPage !== "data" && (
              <button
                onClick={handleCreateNew}
                style={{
                  width: "48px",
                  height: "48px",
                  background: colors.primary,
                  color: colors.white,
                  border: "none",
                  borderRadius: borderRadius.lg,
                  cursor: "pointer",
                  fontSize: "24px",
                  fontWeight: typography.fontWeight.normal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  boxShadow: shadows.sm
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.boxShadow = shadows.md;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.primary;
                  e.currentTarget.style.boxShadow = shadows.sm;
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title={
                  currentPage === "parts" ? "新建零件" :
                  currentPage === "categories" ? "新建分类" :
                  currentPage === "locations" ? "新建盒子" : "新建"
                }
              >
                +
              </button>
            )}
          </div>
          
          {/* 导航标签 */}
          <nav style={{ 
            display: "flex", 
            gap: spacing.sm,
            borderBottom: `1px solid ${colors.gray200}`,
            marginLeft: `-${spacing.sm}`
          }}>
          {[
            { id: "locations", label: "盒子", icon: "" },
            { id: "parts", label: "零件", icon: "" },
            { id: "categories", label: "分类", icon: "" },
            { id: "data", label: "数据", icon: "" }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id as Page)}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  background: "transparent",
                  color: currentPage === tab.id ? colors.primary : colors.gray600,
                  border: "none",
                  borderBottom: `2px solid ${currentPage === tab.id ? colors.accent : "transparent"}`,
                  cursor: "pointer",
                  fontSize: typography.fontSize.sm,
                  fontWeight: currentPage === tab.id ? typography.fontWeight.semibold : typography.fontWeight.medium,
                  transition: "all 0.2s ease",
                  position: "relative",
                  marginBottom: "-1px"
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== tab.id) {
                    e.currentTarget.style.color = colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== tab.id) {
                    e.currentTarget.style.color = colors.gray600;
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: `${spacing['3xl']} ${spacing['3xl']}`
      }}>
        {renderPage()}
      </main>
    </div>
  );
}


