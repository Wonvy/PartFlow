import React, { useEffect, useState } from "react";
import type { Category, Part } from "@partflow/core";
import { api } from "../api/client";

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryParts, setCategoryParts] = useState<Part[]>([]);

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
      setShowForm(false);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert(`${editingId ? '更新' : '创建'}失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name, description: category.description || "" });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除分类 "${name}" 吗？`)) return;
    
    try {
      await api.deleteCategory(id);
      loadCategories();
      if (selectedCategory === id) {
        setSelectedCategory(null);
        setCategoryParts([]);
      }
    } catch (err) {
      alert(`删除失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleViewParts = async (categoryId: string) => {
    try {
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setCategoryParts([]);
        return;
      }
      
      const response = await api.getParts({ categoryId });
      setCategoryParts(response.data);
      setSelectedCategory(categoryId);
    } catch (err) {
      alert(`加载零件失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  if (loading) {
    return <div style={{ padding: 24 }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>分类管理</h2>
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}
          style={{
            padding: "8px 20px",
            background: showForm ? "#6b7280" : "#059669",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          {showForm ? "取消" : "➕ 新建分类"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: 24,
            padding: 20,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 600 }}>
            {editingId ? "编辑分类" : "新建分类"}
          </h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              分类名称 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="例如：紧固件"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="例如：螺栓、螺母、垫片等"
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14,
                fontFamily: "inherit"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              style={{
                padding: "8px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              {editingId ? "更新" : "保存"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "8px 20px",
                background: "white",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              取消
            </button>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "#999" }}>暂无分类</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {categories.map((category) => (
            <div key={category.id}>
              <div
                style={{
                  background: "white",
                  border: selectedCategory === category.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => handleViewParts(category.id)}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 600 }}>📂 {category.name}</h3>
                {category.description && (
                  <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#666" }}>{category.description}</p>
                )}
                <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                  创建于: {new Date(category.createdAt).toLocaleDateString()}
                </p>
                
                <div style={{ marginTop: 12, display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category);
                    }}
                    style={{
                      padding: "4px 12px",
                      background: "white",
                      color: "#2563eb",
                      border: "1px solid #2563eb",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category.id, category.name);
                    }}
                    style={{
                      padding: "4px 12px",
                      background: "white",
                      color: "#dc2626",
                      border: "1px solid #dc2626",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>

              {selectedCategory === category.id && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 16,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8
                  }}
                >
                  <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    📦 此分类的零件 ({categoryParts.length})
                  </h4>
                  {categoryParts.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>暂无零件</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {categoryParts.map((part) => (
                        <div
                          key={part.id}
                          style={{
                            padding: 8,
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: 4,
                            fontSize: 12
                          }}
                        >
                          <div style={{ fontWeight: 500, color: "#111827" }}>
                            {part.name} {part.specification && `- ${part.specification}`}
                          </div>
                          <div style={{ color: "#6b7280", marginTop: 4 }}>
                            库存: {part.quantity} {part.material && `· 材质: ${part.material}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

