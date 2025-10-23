import React, { useState, useEffect } from "react";
import type { Part, Category, Location } from "@partflow/core";
import { api } from "../api/client";

type PartFormProps = {
  part?: Part;
  onSave: (part: Part) => void;
  onCancel: () => void;
};

export function PartForm({ part, onSave, onCancel }: PartFormProps) {
  const [formData, setFormData] = useState({
    name: part?.name || "",
    specification: part?.specification || "",
    material: part?.material || "",
    quantity: part?.quantity || 0,
    minQuantity: part?.minQuantity || 0,
    categoryId: part?.categoryId || "",
    locationId: part?.locationId || "",
    tags: part?.tags?.join(", ") || ""
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategoriesAndLocations();
  }, []);

  const loadCategoriesAndLocations = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        api.getCategories(),
        api.getLocations()
      ]);
      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
    } catch (err) {
      console.error("加载分类和位置失败:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const partData = {
        name: formData.name,
        specification: formData.specification || undefined,
        material: formData.material || undefined,
        quantity: Number(formData.quantity),
        minQuantity: formData.minQuantity ? Number(formData.minQuantity) : undefined,
        categoryId: formData.categoryId || undefined,
        locationId: formData.locationId || undefined,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined
      };

      const result = part
        ? await api.updatePart(part.id, partData)
        : await api.createPart(partData);

      onSave(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: "rgba(0,0,0,0.5)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{ 
        background: "white", 
        borderRadius: 8, 
        padding: 24, 
        maxWidth: 600, 
        width: "90%",
        maxHeight: "90vh",
        overflow: "auto"
      }}>
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 600 }}>
          {part ? "编辑零件" : "创建新零件"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              零件名称 <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              规格
            </label>
            <input
              type="text"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              placeholder="例如：长度 20mm, 直径 6mm"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              材质
            </label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              placeholder="例如：不锈钢 304"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                库存数量 <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                min="0"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                预警阈值
              </label>
              <input
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                min="0"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                分类
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 14
                }}
              >
                <option value="">-- 请选择 --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                位置
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 14
                }}
              >
                <option value="">-- 请选择 --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              标签
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="用逗号分隔，例如：紧固件, 螺栓, 不锈钢"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          {error && (
            <div style={{ 
              padding: 12, 
              marginBottom: 16, 
              background: "#fee", 
              color: "#c33", 
              borderRadius: 4,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: "8px 20px",
                border: "1px solid #ddd",
                background: "white",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 20px",
                border: "none",
                background: "#2563eb",
                color: "white",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

