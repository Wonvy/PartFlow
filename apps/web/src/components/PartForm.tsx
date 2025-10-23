import React, { useState, useEffect } from "react";
import type { Part, Category, Location } from "@partflow/core";
import { api } from "../api/client";
import { ImageUpload } from "./ImageUpload";

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
    tags: part?.tags?.join(", ") || "",
    imageUrl: part?.imageUrl || ""
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        imageUrl: formData.imageUrl || undefined
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
      zIndex: 1000,
      padding: "20px",
      overflowY: "auto"
    }}>
      <div 
        className="part-form-container"
        style={{ 
          background: "white", 
          borderRadius: 8, 
          padding: "20px", 
          maxWidth: "900px", 
          width: "100%",
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
          margin: "auto",
          boxSizing: "border-box"
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 600 }}>
          {part ? "编辑零件" : "创建新零件"}
        </h2>

        <style>{`
          @media (max-width: 768px) {
            .part-form-container {
              padding: 16px !important;
            }
            .part-form-layout {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            .part-form-row {
              grid-template-columns: 1fr !important;
            }
          }
          @media (min-width: 769px) and (max-width: 900px) {
            .part-form-container {
              padding: 18px !important;
            }
            .part-form-layout {
              grid-template-columns: 250px 1fr !important;
              gap: 20px !important;
            }
          }
        `}</style>

        <form onSubmit={handleSubmit}>
          {/* 左右布局：图片 + 表单 */}
          <div 
            className="part-form-layout"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginBottom: 20 }}
          >
            {/* 左侧：图片 */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                零件图片
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
              />
            </div>

            {/* 右侧：表单 */}
            <div>
              {/* 零件名称和规格 - 同一行 */}
              <div 
                className="part-form-row"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}
              >
                <div>
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
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    规格
                  </label>
                  <input
                    type="text"
                    value={formData.specification}
                    onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                    placeholder="例如：M6×20"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* 库存数量和分类 - 同一行 */}
              <div 
                className="part-form-row"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}
              >
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
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>

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
                      fontSize: 14,
                      boxSizing: "border-box"
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
              </div>

              {/* 盒子 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  盒子
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    fontSize: 14,
                    boxSizing: "border-box"
                  }}
                >
                  <option value="">-- 请选择 --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.code}{loc.name ? ` - ${loc.name}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* 折叠按钮 */}
              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    border: "1px solid #ddd",
                    background: "white",
                    color: "#666",
                    borderRadius: 4,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <span>{showAdvanced ? "▼" : "▶"}</span>
                  <span>高级选项</span>
                </button>
              </div>

              {/* 折叠内容 */}
              {showAdvanced && (
                <div style={{
                  padding: 16,
                  background: "#f9fafb",
                  borderRadius: 4,
                  marginBottom: 16
                }}>
                  {/* 材质 */}
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
                        fontSize: 14,
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {/* 标签 */}
                  <div style={{ marginBottom: 0 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                      标签
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="用逗号分隔，例如：紧固件, 螺栓"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        fontSize: 14,
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
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

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
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

