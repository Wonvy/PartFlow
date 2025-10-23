import React, { useEffect, useState } from "react";
import type { Part } from "@partflow/core";
import { api } from "../api/client";
import { PartForm } from "./PartForm";

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
    return <div style={{ padding: 24 }}>加载中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        错误: {error}
        <br />
        <small>请确保后端服务已启动 (pnpm run dev:server)</small>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="搜索零件（名称、规格、材质）..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
            fontSize: 14
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          🔍 搜索
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: "8px 20px",
            background: showFilters ? "#6366f1" : "white",
            color: showFilters ? "white" : "#6b7280",
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          🎯 筛选{showFilters ? " ▲" : " ▼"}
        </button>
        <button
          onClick={handleCreate}
          style={{
            padding: "8px 24px",
            background: "#059669",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          ➕ 新建
        </button>
      </div>

      {showFilters && (
        <div style={{ 
          marginBottom: 16, 
          padding: 16, 
          background: "white", 
          border: "1px solid #e5e7eb", 
          borderRadius: 8 
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                分类筛选
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 13
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
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                位置筛选
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 13
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
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                库存状态
              </label>
              <label style={{ display: "flex", alignItems: "center", padding: "6px 0", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontSize: 13 }}>仅显示低库存</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              onClick={handleSearch}
              style={{
                padding: "6px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 13
              }}
            >
              应用筛选
            </button>
            <button
              onClick={handleClearFilters}
              style={{
                padding: "6px 16px",
                background: "white",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 13
              }}
            >
              清除筛选
            </button>
          </div>
        </div>
      )}

      {parts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
          暂无零件数据
          <br />
          <small>可以通过 API 创建零件: POST http://localhost:3333/api/parts</small>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {parts.map((part) => (
            <div
              key={part.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 16,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {part.imageUrl && (
                <img
                  src={part.imageUrl}
                  alt={part.name}
                  style={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginBottom: 12,
                    background: "#f9fafb"
                  }}
                />
              )}
              <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 600 }}>{part.name}</h3>
              {part.specification && (
                <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>规格: {part.specification}</p>
              )}
              {part.material && <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>材质: {part.material}</p>}
              <p style={{ margin: "8px 0 0 0", fontSize: 14, fontWeight: 500 }}>库存: {part.quantity}</p>
              {part.tags && part.tags.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {part.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        background: "#e0e7ff",
                        color: "#3730a3",
                        borderRadius: 12
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleEdit(part)}
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    border: "1px solid #2563eb",
                    background: "white",
                    color: "#2563eb",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleInventoryChange(part, 10)}
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    border: "1px solid #059669",
                    background: "white",
                    color: "#059669",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  +10 入库
                </button>
                <button
                  onClick={() => handleInventoryChange(part, -10)}
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    border: "1px solid #dc2626",
                    background: "white",
                    color: "#dc2626",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  -10 出库
                </button>
                <button
                  onClick={() => handleDelete(part)}
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    border: "1px solid #dc2626",
                    background: "#dc2626",
                    color: "white",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  删除
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

