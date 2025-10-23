import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import type { Category, Part } from "@partflow/core";
import { api } from "../api/client";
import { colors, typography, spacing, borderRadius, shadows, transitions } from "../styles/design-system";
import { Modal } from "./Modal";

export const CategoriesManager = forwardRef((props, ref) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "", parentId: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryParts, setCategoryParts] = useState<Part[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [iconPreview, setIconPreview] = useState<string>("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error("加载失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 处理空字符串，转换为 undefined
      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        parentId: formData.parentId || undefined
      };

      if (editingId) {
        await api.updateCategory(editingId, submitData);
      } else {
        await api.createCategory(submitData);
      }
      setFormData({ name: "", description: "", icon: "", parentId: "" });
      setShowFormModal(false);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert(`${editingId ? '更新' : '创建'}失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ 
      name: category.name, 
      description: category.description || "", 
      icon: category.icon || "",
      parentId: category.parentId || ""
    });
    setIconPreview(category.icon || "");
    setEditingId(category.id);
    setShowFormModal(true);
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, icon: base64 })); // 使用函数式更新
        setIconPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理剪贴板粘贴（用于图标上传区域）
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        e.stopPropagation(); // 阻止事件冒泡
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            setFormData(prev => ({ ...prev, icon: base64 })); // 使用函数式更新
            setIconPreview(base64);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  // 清除图标
  const handleClearIcon = () => {
    setFormData({ ...formData, icon: "" });
    setIconPreview("");
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`确定要删除分类 "${name}" 吗？`)) return;
    
    try {
      await api.deleteCategory(id);
      loadCategories();
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
        setCategoryParts([]);
      }
    } catch (err) {
      alert(`删除失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleViewParts = async (category: Category) => {
    try {
      const response = await api.getParts({ categoryId: category.id });
      setCategoryParts(response.data);
      setSelectedCategory(category);
      setShowPartsModal(true);
    } catch (err) {
      alert(`加载零件失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleCancel = () => {
    setShowFormModal(false);
    setEditingId(null);
    setFormData({ name: "", description: "", icon: "", parentId: "" });
    setIconPreview("");
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", icon: "", parentId: "" });
    setIconPreview("");
    setShowFormModal(true);
  };

  // 暴露 handleCreate 方法给父组件
  useImperativeHandle(ref, () => ({
    handleCreate: handleAddNew
  }));

  // 切换折叠状态
  const toggleCollapse = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // 获取子分类
  const getChildren = (parentId: string | undefined) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  // 渲染三级分类（叶子节点）卡片 - 正方形卡片
  const renderLeafCategoryCard = (category: Category) => {
    // 检查 icon 是否为图片 URL
    const isImageIcon = category.icon && (
      category.icon.startsWith('http://') || 
      category.icon.startsWith('https://') || 
      category.icon.startsWith('/') ||
      category.icon.startsWith('data:')
    );

    return (
      <div
        key={category.id}
        onMouseEnter={() => setHoveredCard(category.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => handleViewParts(category)}
        style={{
          position: "relative",
          background: colors.surface,
          border: `1px solid ${colors.gray300}`,
          borderRadius: borderRadius.lg,
          cursor: "pointer",
          transition: transitions.fast,
          boxShadow: hoveredCard === category.id ? shadows.md : shadows.sm,
          aspectRatio: "1 / 1", // 正方形
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.md,
          overflow: "hidden"
        }}
      >
        {/* 操作按钮 - 右上角 */}
        {hoveredCard === category.id && (
          <div style={{
            position: "absolute",
            top: spacing.xs,
            right: spacing.xs,
            display: "flex",
            gap: spacing.xs,
            zIndex: 1
          }}>
            <button
              onClick={(e) => handleEdit(category, e)}
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.9)",
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.sm,
                cursor: "pointer",
                fontSize: "12px",
                color: colors.gray600,
                transition: transitions.fast,
                padding: 0,
                boxShadow: shadows.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.gray100;
                e.currentTarget.style.color = colors.gray900;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                e.currentTarget.style.color = colors.gray600;
              }}
            >
              ✎
            </button>
            <button
              onClick={(e) => handleDelete(category.id, category.name, e)}
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.9)",
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.sm,
                cursor: "pointer",
                fontSize: "14px",
                color: colors.gray600,
                transition: transitions.fast,
                padding: 0,
                boxShadow: shadows.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.error;
                e.currentTarget.style.color = colors.white;
                e.currentTarget.style.borderColor = colors.error;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                e.currentTarget.style.color = colors.gray600;
                e.currentTarget.style.borderColor = colors.gray300;
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* 图标 */}
        <div style={{
          fontSize: "48px",
          marginBottom: spacing.sm,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "60%"
        }}>
          {isImageIcon ? (
            <img 
              src={category.icon} 
              alt={category.name}
              style={{
                maxWidth: "80%",
                maxHeight: "100%",
                objectFit: "contain"
              }}
            />
          ) : category.icon ? (
            <span>{category.icon}</span>
          ) : (
            // 默认图标：分类/文件夹图标
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: colors.gray400 }}>
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z"></path>
            </svg>
          )}
        </div>

        {/* 名称 */}
        <div style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.gray900,
          textAlign: "center",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          paddingTop: spacing.xs
        }}>
          {category.name}
        </div>
      </div>
    );
  };

  // 渲染单个分类卡片
  const renderCategoryCard = (category: Category, level: number = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedCategories.has(category.id);

    return (
      <div key={category.id} style={{ marginBottom: level === 0 ? spacing.lg : spacing.sm }}>
        <div
          onMouseEnter={() => setHoveredCard(category.id)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            position: "relative",
            background: "transparent", // 透明背景
            border: "none", // 移除边框
            borderRadius: borderRadius.lg,
            padding: `${level === 0 ? spacing.md : spacing.sm} ${spacing.md}`,
            marginLeft: `${level * 24}px`,
            cursor: "pointer",
            transition: transitions.base
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
            {/* 折叠/展开按钮 */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(category.id);
                }}
                style={{
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: colors.gray100,
                  border: "none",
                  borderRadius: borderRadius.sm,
                  cursor: "pointer",
                  fontSize: "10px",
                  color: colors.gray600,
                  padding: 0,
                  transition: transitions.fast,
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.gray200;
                  e.currentTarget.style.color = colors.gray900;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.gray100;
                  e.currentTarget.style.color = colors.gray600;
                }}
              >
                {isCollapsed ? "▶" : "▼"}
              </button>
            )}
            {!hasChildren && <div style={{ width: "20px", flexShrink: 0 }} />}

            {/* 分类信息 */}
            <div 
              style={{ flex: 1, minWidth: 0 }}
              onClick={() => handleViewParts(category)}
            >
              <h3 style={{
                margin: 0,
                fontSize: level === 0 ? typography.fontSize.lg : typography.fontSize.base,
                fontWeight: level === 0 ? typography.fontWeight.bold : typography.fontWeight.semibold,
                color: colors.gray900,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {/* 一级二级分类不显示图标 */}
                {category.name}
              </h3>

              {category.description && (
                <p style={{
                  margin: `${spacing.xs} 0 0 0`,
                  fontSize: typography.fontSize.sm,
                  color: colors.gray600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {category.description}
                </p>
              )}
            </div>

            {/* 操作按钮 */}
            <div style={{ 
              display: "flex", 
              gap: spacing.sm,
              opacity: hoveredCard === category.id ? 1 : 0,
              visibility: hoveredCard === category.id ? "visible" : "hidden",
              transition: transitions.fast
            }}>
              {/* 添加子分类按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(null);
                  setFormData({ name: "", description: "", icon: "", parentId: category.id });
                  setIconPreview("");
                  setShowFormModal(true);
                }}
                title="添加子分类"
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: colors.surface,
                  border: `1px solid ${colors.gray300}`,
                  borderRadius: borderRadius.full,
                  cursor: "pointer",
                  fontSize: "18px",
                  color: colors.gray600,
                  transition: transitions.fast
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.accent;
                  e.currentTarget.style.color = colors.white;
                  e.currentTarget.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.surface;
                  e.currentTarget.style.color = colors.gray600;
                  e.currentTarget.style.borderColor = colors.gray300;
                }}
              >
                +
              </button>
              <button
                onClick={(e) => handleEdit(category, e)}
                title="编辑分类"
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: colors.surface,
                  border: `1px solid ${colors.gray300}`,
                  borderRadius: borderRadius.full,
                  cursor: "pointer",
                  fontSize: "14px",
                  color: colors.gray600,
                  transition: transitions.fast
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.gray100;
                  e.currentTarget.style.color = colors.gray900;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.surface;
                  e.currentTarget.style.color = colors.gray600;
                }}
              >
                ✎
              </button>
              <button
                onClick={(e) => handleDelete(category.id, category.name, e)}
                title="删除分类"
                style={{
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
                  transition: transitions.fast
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
            </div>
          </div>
        </div>

        {/* 递归渲染子分类 - 如果是二级分类，则使用多列布局显示三级 */}
        {hasChildren && !isCollapsed && (
          <div style={{ marginTop: spacing.md, marginLeft: `${level * 32}px` }}>
            {level === 1 ? (
              // 二级分类的子分类（三级）使用多列布局
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: spacing.sm,
                marginLeft: "32px"
              }}>
                {children.map(child => renderLeafCategoryCard(child))}
              </div>
            ) : (
              // 其他层级继续使用树形布局
              children.map(child => renderCategoryCard(child, level + 1))
            )}
          </div>
        )}
      </div>
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

  return (
    <div>
      {/* 标题和操作栏 */}
      <div style={{ 
        marginBottom: spacing['2xl'], 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: typography.fontSize['2xl'], 
            fontWeight: typography.fontWeight.semibold,
            color: colors.gray900
          }}>
            分类管理
          </h2>
          <p style={{
            margin: `${spacing.xs} 0 0 0`,
            fontSize: typography.fontSize.sm,
            color: colors.gray600
          }}>
            {categories.length} 个分类
          </p>
        </div>
        <button
          onClick={handleAddNew}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: colors.primary,
            color: colors.white,
            border: "none",
            borderRadius: borderRadius.md,
            cursor: "pointer",
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            transition: transitions.base
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.primaryLight}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.primary}
        >
          + 新建分类
        </button>
      </div>

      {/* 分类列表 */}
      {categories.length === 0 ? (
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
              暂无分类
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: typography.fontSize.sm, 
              color: colors.gray500
            }}>
              点击上方"新建分类"按钮开始添加
            </p>
          </div>
        </div>
      ) : (
        <div>
          {getChildren(undefined).map((category) => renderCategoryCard(category, 0))}
        </div>
      )}

      {/* 旧的卡片代码（已弃用） */}
      {false && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: spacing.xl 
        }}>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleViewParts(category)}
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative",
                background: colors.surface,
                border: `2px solid ${colors.gray200}`,
                borderRadius: borderRadius.lg,
                padding: spacing.xl,
                cursor: "pointer",
                transition: transitions.base,
                boxShadow: hoveredCard === category.id ? shadows.lg : "none"
              }}
            >
              {/* 删除按钮 - 右上角图标 */}
              {hoveredCard === category.id && (
                <button
                  onClick={(e) => handleDelete(category.id, category.name, e)}
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
                    boxShadow: shadows.sm
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

              {/* 分类名称 */}
              <h3 style={{
                margin: 0,
                marginBottom: spacing.sm,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray900,
                paddingRight: spacing['3xl']
              }}>
                {category.icon && <span style={{ marginRight: spacing.sm }}>{category.icon}</span>}
                {category.name}
              </h3>

              {/* 父分类标签 */}
              {category.parentId && (
                <div style={{
                  marginBottom: spacing.md,
                  fontSize: typography.fontSize.xs,
                  color: colors.gray500
                }}>
                  <span style={{
                    display: "inline-block",
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: colors.gray100,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.xs
                  }}>
                    {(() => {
                      const parent = categories.find(c => c.id === category.parentId);
                      if (!parent) return "未知父分类";
                      // 只显示非图片的 icon（如 emoji）
                      const displayIcon = parent.icon && 
                        !parent.icon.startsWith('http') && 
                        !parent.icon.startsWith('data:') && 
                        !parent.icon.startsWith('/') 
                          ? parent.icon + " " 
                          : "";
                      return `${displayIcon}${parent.name}`;
                    })()}
                  </span>
                </div>
              )}

              {/* 描述 */}
              {category.description && (
                <p style={{
                  margin: 0,
                  marginBottom: spacing.xl,
                  fontSize: typography.fontSize.sm,
                  color: colors.gray600,
                  lineHeight: typography.lineHeight.relaxed
                }}>
                  {category.description}
                </p>
              )}

              {/* 编辑按钮 */}
              <div style={{ marginTop: spacing.md }}>
                <button
                  onClick={(e) => handleEdit(category, e)}
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
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 旧代码结束 */}

      {/* 表单 Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={handleCancel}
        title={editingId ? "编辑分类" : "新建分类"}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: "block",
              marginBottom: spacing.sm,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700
            }}>
              分类名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入分类名称"
              required
              autoFocus
              style={{
                width: "100%",
                padding: `${spacing.md} ${spacing.lg}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                color: colors.gray900,
                backgroundColor: colors.surface,
                outline: "none",
                transition: transitions.base,
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
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: "block",
              marginBottom: spacing.sm,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700
            }}>
              图标（可选）
            </label>

            {/* 图标预览 */}
            {iconPreview && (
              <div style={{
                marginBottom: spacing.md,
                padding: spacing.md,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                display: "flex",
                alignItems: "center",
                gap: spacing.md,
                background: colors.gray50
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: colors.surface,
                  borderRadius: borderRadius.sm,
                  border: `1px solid ${colors.gray200}`
                }}>
                  <img src={iconPreview} alt="预览" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: typography.fontSize.sm, 
                    color: colors.gray700,
                    fontWeight: typography.fontWeight.medium 
                  }}>
                    图标已上传
                  </p>
                  <p style={{ 
                    margin: `${spacing.xs} 0 0 0`, 
                    fontSize: typography.fontSize.xs, 
                    color: colors.gray500 
                  }}>
                    {iconPreview.startsWith('data:') ? '本地图片' : '图片链接'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearIcon}
                  style={{
                    padding: `${spacing.xs} ${spacing.md}`,
                    background: colors.surface,
                    color: colors.error,
                    border: `1px solid ${colors.gray300}`,
                    borderRadius: borderRadius.sm,
                    cursor: "pointer",
                    fontSize: typography.fontSize.sm,
                    transition: transitions.fast
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.error;
                    e.currentTarget.style.color = colors.white;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.surface;
                    e.currentTarget.style.color = colors.error;
                  }}
                >
                  更换图标
                </button>
              </div>
            )}

            {/* 图片上传区域 */}
            {!iconPreview && (
              <div>
                {/* 粘贴区域 */}
                <div
                  onPaste={handlePaste}
                  tabIndex={0}
                  style={{
                    width: "100%",
                    padding: spacing.xl,
                    border: `2px dashed ${colors.gray300}`,
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.gray50,
                    marginBottom: spacing.md,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: transitions.base,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.accent;
                    e.currentTarget.style.backgroundColor = colors.accent + "10";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.gray300;
                    e.currentTarget.style.backgroundColor = colors.gray50;
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent;
                    e.currentTarget.style.backgroundColor = colors.accent + "10";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.gray300;
                    e.currentTarget.style.backgroundColor = colors.gray50;
                  }}
                >
                  <div style={{ marginBottom: spacing.sm }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: colors.gray400 }}>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    </svg>
                  </div>
                  <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: colors.gray700, fontWeight: typography.fontWeight.medium }}>
                    点击此处，然后按 Ctrl+V 粘贴图片
                  </p>
                  <p style={{ margin: `${spacing.xs} 0 0 0`, fontSize: typography.fontSize.xs, color: colors.gray500 }}>
                    或选择下方的文件上传按钮
                  </p>
                </div>

                {/* 文件上传按钮 */}
                <label style={{
                  display: "block",
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`,
                  background: colors.surface,
                  color: colors.gray700,
                  border: `1px solid ${colors.gray300}`,
                  borderRadius: borderRadius.md,
                  cursor: "pointer",
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  textAlign: "center",
                  transition: transitions.fast,
                  boxSizing: "border-box"
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: spacing.xs, verticalAlign: "middle" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  选择图片文件
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>

                <p style={{
                  margin: `${spacing.md} 0 0 0`,
                  fontSize: typography.fontSize.xs,
                  color: colors.gray500,
                  lineHeight: typography.lineHeight.relaxed,
                  textAlign: "center"
                }}>
                  支持 PNG、JPG、SVG 等图片格式（建议尺寸：128x128 像素）
                </p>
              </div>
            )}
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: "block",
              marginBottom: spacing.sm,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700
            }}>
              父分类（可选）
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              aria-label="选择父分类"
              style={{
                width: "100%",
                padding: `${spacing.md} ${spacing.lg}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                color: colors.gray900,
                backgroundColor: colors.surface,
                outline: "none",
                transition: transitions.base,
                boxSizing: "border-box",
                cursor: "pointer"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}15`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.gray300;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="">无（顶级分类）</option>
              {categories
                .filter(c => c.id !== editingId) // 排除自己，避免循环引用
                .map(category => {
                  // 只显示非图片的 icon（如 emoji）
                  const displayIcon = category.icon && 
                    !category.icon.startsWith('http') && 
                    !category.icon.startsWith('data:') && 
                    !category.icon.startsWith('/') 
                      ? category.icon + " " 
                      : "";
                  return (
                    <option key={category.id} value={category.id}>
                      {displayIcon}{category.name}
                    </option>
                  );
                })}
            </select>
          </div>

          <div style={{ marginBottom: spacing.xl }}>
            <label style={{
              display: "block",
              marginBottom: spacing.sm,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700
            }}>
              描述（可选）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入描述"
              rows={4}
              style={{
                width: "100%",
                padding: `${spacing.md} ${spacing.lg}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                color: colors.gray900,
                backgroundColor: colors.surface,
                outline: "none",
                resize: "vertical",
                fontFamily: typography.fontFamily.base,
                transition: transitions.base,
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
          </div>

          <div style={{ display: "flex", gap: spacing.sm, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: `${spacing.md} ${spacing.xl}`,
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
              取消
            </button>
            <button
              type="submit"
              style={{
                padding: `${spacing.md} ${spacing.xl}`,
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
              {editingId ? "保存修改" : "创建分类"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 零件列表 Modal */}
      <Modal
        isOpen={showPartsModal}
        onClose={() => setShowPartsModal(false)}
        title={selectedCategory ? `${selectedCategory.name} 的零件` : "零件列表"}
        maxWidth="800px"
      >
        {categoryParts.length === 0 ? (
          <div style={{ textAlign: "center", padding: spacing['3xl'], color: colors.gray500 }}>
            <p style={{ margin: 0, fontSize: typography.fontSize.base }}>该分类下暂无零件</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            {categoryParts.map((part) => (
              <div
                key={part.id}
                style={{
                  padding: spacing.lg,
                  background: colors.gray50,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.gray200}`,
                  transition: transitions.base
                }}
              >
                <div style={{ 
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: spacing.sm
                }}>
                  <div style={{ 
                    fontWeight: typography.fontWeight.semibold, 
                    color: colors.gray900,
                    fontSize: typography.fontSize.base
                  }}>
                    {part.name}
                  </div>
                  <div style={{
                    padding: `${spacing.xs} ${spacing.md}`,
                    background: part.quantity <= (part.minQuantity || 0) ? colors.error : colors.success,
                    color: colors.white,
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium
                  }}>
                    库存: {part.quantity}
                  </div>
                </div>
                
                {part.specification && (
                  <div style={{ 
                    color: colors.gray600, 
                    fontSize: typography.fontSize.sm,
                    marginBottom: spacing.xs
                  }}>
                    规格: {part.specification}
                  </div>
                )}
                
                {part.material && (
                  <div style={{ 
                    color: colors.gray600, 
                    fontSize: typography.fontSize.sm
                  }}>
                    材质: {part.material}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
});
