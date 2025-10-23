import React, { useEffect, useState } from "react";
import type { Part } from "@partflow/core";
import { api } from "../api/client";
import { PartForm } from "./PartForm";
import { colors, typography, spacing, borderRadius, shadows, transitions } from "../styles/design-system";

export function PartsList() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>(undefined);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    loadParts();
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        api.getCategories(),
        api.getLocations()
      ]);
      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
    } catch (err) {
      console.error("加载筛选项失败:", err);
    }
  };

  const loadParts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getParts({ 
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        locationId: selectedLocation || undefined,
        lowStock: lowStockOnly || undefined
      });
      setParts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadParts();
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedLocation("");
    setLowStockOnly(false);
    setTimeout(() => loadParts(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (part: Part) => {
    if (!confirm(`确定要删除零件"${part.name}"吗？`)) return;

    try {
      await api.deletePart(part.id);
      loadParts();
    } catch (err) {
      alert(`删除失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleInventoryChange = async (part: Part, delta: number) => {
    const reason = delta > 0 ? "入库" : "出库";
    try {
      await api.updateInventory(part.id, delta, reason);
      loadParts();
    } catch (err) {
      alert(`库存更新失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingPart(undefined);
    loadParts();
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingPart(undefined);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: spacing['4xl'], 
        textAlign: "center",
        color: colors.gray500,
        fontSize: typography.fontSize.sm
      }}>
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: spacing['4xl'],
        textAlign: "center"
      }}>
        <div style={{
          padding: spacing['2xl'],
          background: colors.surface,
          border: `1px solid ${colors.error}20`,
          borderRadius: borderRadius.lg,
          color: colors.error,
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          <p style={{ margin: 0, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium }}>
            错误: {error}
          </p>
          <p style={{ margin: `${spacing.md} 0 0 0`, fontSize: typography.fontSize.sm, color: colors.gray600 }}>
            请确保后端服务已启动 (pnpm run dev:server)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 搜索和操作栏 */}
      <div style={{ 
        marginBottom: spacing['2xl'], 
        display: "flex", 
        gap: spacing.md, 
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="搜索零件名称、规格或材质..."
          style={{
            flex: 1,
            minWidth: "280px",
            padding: `${spacing.md} ${spacing.lg}`,
            border: `1px solid ${colors.gray300}`,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            color: colors.gray900,
            backgroundColor: colors.surface,
            transition: transitions.base,
            outline: "none"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.accent;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}15`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.gray300;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: colors.accent,
            color: colors.white,
            border: "none",
            borderRadius: borderRadius.md,
            cursor: "pointer",
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            transition: transitions.base,
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.accentLight}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.accent}
        >
          搜索
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: `${spacing.md} ${spacing.lg}`,
            background: showFilters ? colors.gray900 : colors.surface,
            color: showFilters ? colors.white : colors.gray700,
            border: `1px solid ${showFilters ? colors.gray900 : colors.gray300}`,
            borderRadius: borderRadius.md,
            cursor: "pointer",
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            transition: transitions.base,
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => {
            if (!showFilters) {
              e.currentTarget.style.background = colors.gray100;
            }
          }}
          onMouseLeave={(e) => {
            if (!showFilters) {
              e.currentTarget.style.background = colors.surface;
            }
          }}
        >
          筛选 {showFilters ? "↑" : "↓"}
        </button>
        <button
          onClick={handleCreate}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: colors.primary,
            color: colors.white,
            border: "none",
            borderRadius: borderRadius.md,
            cursor: "pointer",
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            transition: transitions.base,
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.primaryLight}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.primary}
        >
          + 新建零件
        </button>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div style={{ 
          marginBottom: spacing['2xl'], 
          padding: spacing.xl, 
          background: colors.surface, 
          border: `1px solid ${colors.gray200}`, 
          borderRadius: borderRadius.lg 
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: spacing.lg }}>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium,
                color: colors.gray700
              }}>
                分类
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `1px solid ${colors.gray300}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  color: colors.gray900,
                  backgroundColor: colors.surface,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="">全部分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium,
                color: colors.gray700
              }}>
                位置
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `1px solid ${colors.gray300}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  color: colors.gray900,
                  backgroundColor: colors.surface,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="">全部位置</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium,
                color: colors.gray700
              }}>
                库存状态
              </label>
              <label style={{ display: "flex", alignItems: "center", padding: `${spacing.sm} 0`, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  style={{ marginRight: spacing.sm, cursor: "pointer" }}
                />
                <span style={{ fontSize: typography.fontSize.sm, color: colors.gray700 }}>仅显示低库存</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: spacing.lg, display: "flex", gap: spacing.sm }}>
            <button
              onClick={handleSearch}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: colors.accent,
                color: colors.white,
                border: "none",
                borderRadius: borderRadius.md,
                cursor: "pointer",
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                transition: transitions.base
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.accentLight}
              onMouseLeave={(e) => e.currentTarget.style.background = colors.accent}
            >
              应用筛选
            </button>
            <button
              onClick={handleClearFilters}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: colors.surface,
                color: colors.gray700,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                transition: transitions.base
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.gray100}
              onMouseLeave={(e) => e.currentTarget.style.background = colors.surface}
            >
              清除筛选
            </button>
          </div>
        </div>
      )}

      {/* 零件列表或空状态 */}
      {parts.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: spacing['5xl'], 
          color: colors.gray500
        }}>
          <div style={{
            padding: spacing['3xl'],
            background: colors.surface,
            borderRadius: borderRadius.lg,
            maxWidth: "400px",
            margin: "0 auto"
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: typography.fontSize.lg, 
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700,
              marginBottom: spacing.md
            }}>
              暂无零件数据
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: typography.fontSize.sm, 
              color: colors.gray500
            }}>
              点击上方"新建零件"按钮开始添加
            </p>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: spacing.xl 
        }}>
          {parts.map((part) => (
            <div
              key={part.id}
              onMouseEnter={() => setHoveredCard(part.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative",
                background: colors.surface,
                border: `1px solid ${colors.gray200}`,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
                display: "flex",
                flexDirection: "column",
                transition: transitions.base,
                boxShadow: hoveredCard === part.id ? shadows.lg : "none",
                borderColor: hoveredCard === part.id ? colors.gray300 : colors.gray200
              }}
            >
              {/* 删除按钮 - 右上角图标 */}
              {hoveredCard === part.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(part);
                  }}
                  style={{
                    position: "absolute",
                    top: spacing.md,
                    right: spacing.md,
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: colors.surface,
                    border: `1px solid ${colors.gray300}`,
                    borderRadius: borderRadius.full,
                    cursor: "pointer",
                    fontSize: "16px",
                    color: colors.gray600,
                    transition: transitions.fast,
                    boxShadow: shadows.sm,
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.error;
                    e.currentTarget.style.color = colors.white;
                    e.currentTarget.style.borderColor = colors.error;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.surface;
                    e.currentTarget.style.color = colors.gray600;
                    e.currentTarget.style.borderColor = colors.gray300;
                  }}
                >
                  ×
                </button>
              )}

              {/* 零件图片 */}
              {part.imageUrl && (
                <img
                  src={part.imageUrl}
                  alt={part.name}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: borderRadius.md,
                    marginBottom: spacing.lg,
                    background: colors.gray100
                  }}
                />
              )}
              
              {/* 零件名称 */}
              <h3 style={{ 
                margin: 0, 
                marginBottom: spacing.md,
                fontSize: typography.fontSize.lg, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray900
              }}>
                {part.name}
              </h3>
              
              {/* 规格和材质 */}
              <div style={{ marginBottom: spacing.lg }}>
                {part.specification && (
                  <p style={{ 
                    margin: `${spacing.xs} 0`, 
                    fontSize: typography.fontSize.sm, 
                    color: colors.gray600
                  }}>
                    {part.specification}
                  </p>
                )}
                {part.material && (
                  <p style={{ 
                    margin: `${spacing.xs} 0`, 
                    fontSize: typography.fontSize.sm, 
                    color: colors.gray600
                  }}>
                    {part.material}
                  </p>
                )}
              </div>
              
              {/* 库存数量 */}
              <div style={{ 
                marginBottom: spacing.md,
                padding: `${spacing.sm} ${spacing.md}`,
                background: colors.gray50,
                borderRadius: borderRadius.md
              }}>
                <span style={{ 
                  fontSize: typography.fontSize.sm, 
                  color: colors.gray600,
                  marginRight: spacing.sm
                }}>
                  库存
                </span>
                <span style={{ 
                  fontSize: typography.fontSize.base, 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.primary
                }}>
                  {part.quantity}
                </span>
              </div>
              
              {/* 标签 */}
              {part.tags && part.tags.length > 0 && (
                <div style={{ marginBottom: spacing.lg, display: "flex", gap: spacing.xs, flexWrap: "wrap" }}>
                  {part.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: typography.fontSize.xs,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: colors.gray100,
                        color: colors.gray700,
                        borderRadius: borderRadius.full,
                        fontWeight: typography.fontWeight.medium
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 操作按钮 */}
              <div style={{ marginTop: "auto", display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(part);
                  }}
                  style={{
                    flex: "1 1 auto",
                    padding: `${spacing.sm} ${spacing.md}`,
                    fontSize: typography.fontSize.xs,
                    border: `1px solid ${colors.gray300}`,
                    background: colors.surface,
                    color: colors.gray700,
                    borderRadius: borderRadius.md,
                    cursor: "pointer",
                    fontWeight: typography.fontWeight.medium,
                    transition: transitions.base
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.gray100;
                    e.currentTarget.style.borderColor = colors.gray400;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.surface;
                    e.currentTarget.style.borderColor = colors.gray300;
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInventoryChange(part, 10);
                  }}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    fontSize: typography.fontSize.xs,
                    border: `1px solid ${colors.gray300}`,
                    background: colors.surface,
                    color: colors.gray700,
                    borderRadius: borderRadius.md,
                    cursor: "pointer",
                    fontWeight: typography.fontWeight.medium,
                    transition: transitions.base
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.gray100;
                    e.currentTarget.style.borderColor = colors.gray400;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.surface;
                    e.currentTarget.style.borderColor = colors.gray300;
                  }}
                >
                  +10
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInventoryChange(part, -10);
                  }}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    fontSize: typography.fontSize.xs,
                    border: `1px solid ${colors.gray300}`,
                    background: colors.surface,
                    color: colors.gray700,
                    borderRadius: borderRadius.md,
                    cursor: "pointer",
                    fontWeight: typography.fontWeight.medium,
                    transition: transitions.base
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.gray100;
                    e.currentTarget.style.borderColor = colors.gray400;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.surface;
                    e.currentTarget.style.borderColor = colors.gray300;
                  }}
                >
                  -10
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PartForm
          part={editingPart}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPart(undefined);
          }}
        />
      )}
    </div>
  );
}

