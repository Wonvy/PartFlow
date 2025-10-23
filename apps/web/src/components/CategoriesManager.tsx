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
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryParts, setCategoryParts] = useState<Part[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
      if (editingId) {
        await api.updateCategory(editingId, formData);
      } else {
        await api.createCategory(formData);
      }
      setFormData({ name: "", description: "" });
      setShowFormModal(false);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert(`${editingId ? '更新' : '创建'}失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ name: category.name, description: category.description || "" });
    setEditingId(category.id);
    setShowFormModal(true);
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
    setFormData({ name: "", description: "" });
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setShowFormModal(true);
  };

  // 暴露 handleCreate 方法给父组件
  useImperativeHandle(ref, () => ({
    handleCreate: handleAddNew
  }));

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
                {category.name}
              </h3>

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
