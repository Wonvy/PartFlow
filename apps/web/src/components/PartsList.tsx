import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import type { Part } from "@partflow/core";
import { api } from "../api/client";
import { PartForm } from "./PartForm";
import { colors, typography, spacing, borderRadius, shadows, transitions } from "../styles/design-system";

export const PartsList = forwardRef((props, ref) => {
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<Record<string, number>>({});

  useEffect(() => {
    loadParts();
    loadFilters();
  }, []);

  // 实时搜索：当搜索条件改变时自动触发（带防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      loadParts();
    }, 300); // 300ms 防抖延迟

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLocation]);

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

  // 构建层级分类列表
  const buildHierarchicalCategories = () => {
    const result: { id: string; label: string; level: number }[] = [];
    
    // 递归函数来构建层级
    const buildTree = (parentId: string | undefined, level: number, prefix: string) => {
      const children = categories.filter((cat: any) => cat.parentId === parentId);
      children.forEach((cat: any) => {
        // 只显示 emoji 图标，不显示图片 URL 或 base64 数据
        const displayIcon = cat.icon && !cat.icon.startsWith('http') && !cat.icon.startsWith('data:') && !cat.icon.startsWith('/') 
          ? cat.icon + ' ' 
          : '';
        
        result.push({
          id: cat.id,
          label: `${prefix}${displayIcon}${cat.name}`,
          level
        });
        // 递归处理子分类
        buildTree(cat.id, level + 1, prefix + '　');
      });
    };
    
    // 从顶级分类开始
    buildTree(undefined, 0, '');
    return result;
  };

  const loadParts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getParts({ 
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        locationId: selectedLocation || undefined
      });
      setParts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedLocation("");
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

  // 暴露 handleCreate 方法给父组件
  useImperativeHandle(ref, () => ({
    handleCreate
  }));

  // 高亮搜索关键词
  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) {
      return <span>{text}</span>;
    }

    // 使用正则表达式进行不区分大小写的匹配
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <span 
              key={index}
              style={{
                backgroundColor: '#fef08a', // 黄色背景 (Tailwind yellow-200)
                color: colors.gray900,
                padding: '1px 2px',
                borderRadius: '2px'
              }}
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
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
      {/* 页头：搜索和筛选栏 */}
      <div style={{ 
        marginBottom: spacing['2xl'], 
        display: "flex", 
        justifyContent: "space-between",
        gap: spacing.md, 
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {/* 搜索框 */}
        <div style={{ 
          flex: 1,
          maxWidth: "400px",
          position: "relative" 
        }}>
          {/* 搜索图标（左侧） */}
          <div style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: colors.gray400,
            pointerEvents: "none",
            zIndex: 1
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索零件名称、规格或材质..."
            style={{
              width: "100%",
              padding: `${spacing.md} ${spacing.lg}`,
              paddingLeft: "40px",
              paddingRight: search ? "40px" : spacing.lg,
              border: `1px solid ${colors.gray300}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              color: colors.gray900,
              backgroundColor: colors.surface,
              transition: transitions.base,
              outline: "none",
              boxSizing: "border-box"
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

          {/* 清除按钮（右侧，仅在有输入时显示） */}
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                borderRadius: borderRadius.full,
                cursor: "pointer",
                color: colors.gray500,
                fontSize: "16px",
                transition: transitions.fast,
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.gray100;
                e.currentTarget.style.color = colors.gray700;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = colors.gray500;
              }}
              title="清除搜索"
            >
              ×
            </button>
          )}
        </div>
        
        {/* 筛选按钮组（右侧） */}
        <div style={{
          display: "flex",
          gap: spacing.md,
          alignItems: "center"
        }}>
          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              border: `1px solid ${colors.gray300}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              color: colors.gray700,
              backgroundColor: colors.surface,
              cursor: "pointer",
              outline: "none",
              fontWeight: typography.fontWeight.medium,
              minWidth: "120px"
            }}
          >
            <option value="">全部分类</option>
            {buildHierarchicalCategories().map((cat) => (
              <option 
                key={cat.id} 
                value={cat.id}
                style={{
                  paddingLeft: `${cat.level * 16}px`
                }}
              >
                {cat.label}
              </option>
            ))}
          </select>

          {/* 盒子筛选 */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              border: `1px solid ${colors.gray300}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              color: colors.gray700,
              backgroundColor: colors.surface,
              cursor: "pointer",
              outline: "none",
              fontWeight: typography.fontWeight.medium,
              minWidth: "120px"
            }}
          >
            <option value="">全部盒子</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.code}{loc.name ? ` - ${loc.name}` : ""}
              </option>
            ))}
          </select>

          {/* 清除筛选 */}
          {(selectedCategory || selectedLocation) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                background: colors.surface,
                color: colors.gray600,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                transition: transitions.base,
                whiteSpace: "nowrap"
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
              清除
            </button>
          )}
        </div>
      </div>

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
              onClick={() => handleEdit(part)}
              onMouseEnter={() => setHoveredCard(part.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative",
                background: colors.surface,
                border: `1px solid ${colors.gray200}`,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                display: "flex",
                flexDirection: "column",
                transition: transitions.base,
                boxShadow: hoveredCard === part.id ? shadows.lg : "none",
                borderColor: hoveredCard === part.id ? colors.gray300 : colors.gray200,
                cursor: "pointer"
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
                    top: spacing.sm,
                    right: spacing.sm,
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: colors.surface,
                    border: `1px solid ${colors.gray300}`,
                    borderRadius: borderRadius.full,
                    cursor: "pointer",
                    fontSize: "14px",
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

              {/* 左右布局：图片和内容 */}
              <div style={{ display: "flex", gap: spacing.lg }}>
                {/* 左侧：零件图片（正方形） */}
                <div style={{
                  flex: "0 0 80px",
                  width: "80px",
                  height: "80px"
                }}>
                  {part.imageUrl ? (
                    <img
                      src={part.imageUrl}
                      alt={part.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: borderRadius.md,
                        background: colors.gray100
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      background: colors.gray100,
                      borderRadius: borderRadius.md,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: colors.gray400,
                      fontSize: typography.fontSize.xs
                    }}>
                      无图片
                    </div>
                  )}
                </div>

                {/* 右侧：零件信息 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                  {/* 零件名称 */}
                  <h3 style={{ 
                    margin: 0, 
                    marginBottom: spacing.xs,
                    fontSize: typography.fontSize.base, 
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.gray900,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {highlightText(part.name, search)}
                  </h3>
                  
                  {/* 规格和材质 */}
                  {(part.specification || part.material) && (
                    <div style={{ marginBottom: spacing.xs }}>
                      {part.specification && (
                        <p style={{ 
                          margin: 0, 
                          fontSize: typography.fontSize.xs, 
                          color: colors.gray600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {highlightText(part.specification, search)}
                        </p>
                      )}
                      {part.material && (
                        <p style={{ 
                          margin: 0, 
                          fontSize: typography.fontSize.xs, 
                          color: colors.gray600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {highlightText(part.material, search)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* 库存数量 - 带加减按钮的输入框 */}
                  <div style={{ 
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs
                  }}>
                    <span style={{ 
                      fontSize: typography.fontSize.xs, 
                      color: colors.gray500
                    }}>
                      库存:
                    </span>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.xs
                    }}>
                      {/* 减号按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInventoryChange(part, -1);
                        }}
                        style={{
                          width: "24px",
                          height: "24px",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: colors.surface,
                          border: `1px solid ${colors.gray300}`,
                          borderRadius: borderRadius.sm,
                          cursor: "pointer",
                          fontSize: "14px",
                          color: colors.gray700,
                          transition: transitions.fast
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
                        −
                      </button>

                      {/* 库存输入框 */}
                      <input
                        type="number"
                        value={editingQuantity[part.id] ?? part.quantity}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newValue = parseInt(e.target.value) || 0;
                          setEditingQuantity(prev => ({
                            ...prev,
                            [part.id]: newValue
                          }));
                        }}
                        onBlur={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          const delta = newValue - part.quantity;
                          if (delta !== 0) {
                            handleInventoryChange(part, delta);
                          }
                          // 清除编辑状态
                          setEditingQuantity(prev => {
                            const newState = { ...prev };
                            delete newState[part.id];
                            return newState;
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur(); // 触发 onBlur 事件
                          }
                        }}
                        style={{
                          width: "50px",
                          height: "24px",
                          padding: "0 4px",
                          textAlign: "center",
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: part.minQuantity && part.quantity <= part.minQuantity ? colors.error : colors.primary,
                          border: `1px solid ${colors.gray300}`,
                          borderRadius: borderRadius.sm,
                          background: colors.surface,
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />

                      {/* 加号按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInventoryChange(part, 1);
                        }}
                        style={{
                          width: "24px",
                          height: "24px",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: colors.surface,
                          border: `1px solid ${colors.gray300}`,
                          borderRadius: borderRadius.sm,
                          cursor: "pointer",
                          fontSize: "14px",
                          color: colors.gray700,
                          transition: transitions.fast
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
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 标签 */}
              {part.tags && part.tags.length > 0 && (
                <div style={{ marginTop: spacing.md, display: "flex", gap: spacing.xs, flexWrap: "wrap" }}>
                  {part.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: typography.fontSize.xs,
                        padding: `2px ${spacing.xs}`,
                        background: colors.gray100,
                        color: colors.gray600,
                        borderRadius: borderRadius.sm,
                        fontWeight: typography.fontWeight.medium
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {part.tags.length > 3 && (
                    <span style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.gray400
                    }}>
                      +{part.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
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
});

