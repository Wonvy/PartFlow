import React, { useEffect, useState } from "react";
import type { Category } from "@partflow/core";
import { api } from "../api/client";

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCategory(formData);
      setFormData({ name: "", description: "" });
      setShowForm(false);
      loadCategories();
    } catch (err) {
      alert(`创建失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>分类管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "8px 20px",
            background: "#059669",
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
          onSubmit={handleCreate}
          style={{
            marginBottom: 24,
            padding: 20,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8
          }}
        >
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
            保存
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "#999" }}>暂无分类</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 16,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 600 }}>{category.name}</h3>
              {category.description && (
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{category.description}</p>
              )}
              <p style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                创建于: {new Date(category.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

