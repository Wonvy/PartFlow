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
    // 始终创建新零件
    if (partsListRef.current) {
      // 如果不在零件页面，先切换到零件页面
      if (currentPage !== "parts") {
        setCurrentPage("parts");
      }
      partsListRef.current.handleCreate();
    }
  };

  // 不使用条件渲染，而是始终挂载所有组件，用 display 控制显示
  // 这样可以确保 ref 始终有效，点击全局 [ + ] 按钮时能正常调用

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
                PartFlow Desktop
              </h1>
              <p style={{ 
                margin: `${spacing.xs} 0 0 0`, 
                fontSize: typography.fontSize.sm, 
                color: colors.gray600,
                fontWeight: typography.fontWeight.normal
              }}>
                零件管理系统 · 桌面端
              </p>
            </div>
            
            {/* 新建零件按钮 - 在所有页面都显示 */}
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
              title="新建零件"
            >
              +
            </button>
          </div>
          
          {/* 导航标签 */}
          <nav style={{ 
            display: "flex", 
            justifyContent: "space-between",
            borderBottom: `1px solid ${colors.gray200}`,
            marginLeft: `-${spacing.sm}`
          }}>
            {/* 左侧选项卡组 */}
            <div style={{ display: "flex", gap: spacing.sm }}>
              {[
                { id: "locations", label: "盒子", icon: "" },
                { id: "parts", label: "零件", icon: "" },
                { id: "categories", label: "分类", icon: "" }
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
            </div>

            {/* 右侧选项卡（数据管理） */}
            <div style={{ display: "flex", gap: spacing.sm }}>
              <button
                onClick={() => setCurrentPage("data")}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  background: "transparent",
                  color: currentPage === "data" ? colors.primary : colors.gray600,
                  border: "none",
                  borderBottom: `2px solid ${currentPage === "data" ? colors.accent : "transparent"}`,
                  cursor: "pointer",
                  fontSize: typography.fontSize.sm,
                  fontWeight: currentPage === "data" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                  transition: "all 0.2s ease",
                  position: "relative",
                  marginBottom: "-1px"
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== "data") {
                    e.currentTarget.style.color = colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== "data") {
                    e.currentTarget.style.color = colors.gray600;
                  }
                }}
              >
                数据
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: `${spacing['3xl']} ${spacing['3xl']}`
      }}>
        {/* 始终挂载所有组件，通过 display 控制显示 */}
        <div style={{ display: currentPage === "parts" ? "block" : "none" }}>
          <PartsList ref={partsListRef} />
        </div>
        <div style={{ display: currentPage === "categories" ? "block" : "none" }}>
          <CategoriesManager ref={categoriesRef} />
        </div>
        <div style={{ display: currentPage === "locations" ? "block" : "none" }}>
          <LocationsManager ref={locationsRef} />
        </div>
        <div style={{ display: currentPage === "data" ? "block" : "none" }}>
          <DataManager />
        </div>
      </main>
    </div>
  );
}
