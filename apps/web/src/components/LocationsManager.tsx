import React, { useEffect, useState } from "react";
import type { Location, Part } from "@partflow/core";
import { api } from "../api/client";
import { colors, typography, spacing, borderRadius, shadows, transitions } from "../styles/design-system";
import { Modal } from "./Modal";

export function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: "", name: "", description: "" });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationParts, setLocationParts] = useState<Part[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [partCounts, setPartCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await api.getLocations();
      setLocations(response.data);
      
      // 加载每个盒子的零件数量
      const counts: Record<string, number> = {};
      await Promise.all(
        response.data.map(async (location) => {
          try {
            const partsResponse = await api.getParts({ locationId: location.id });
            counts[location.id] = partsResponse.data.length;
          } catch {
            counts[location.id] = 0;
          }
        })
      );
      setPartCounts(counts);
    } catch (err) {
      console.error("加载失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证编号格式
    const codeRegex = /^[A-Z0-9]+$/;
    if (!codeRegex.test(formData.code.toUpperCase())) {
      alert("盒子编号只能包含字母和数字！");
      return;
    }
    
    try {
      if (editingId) {
        await api.updateLocation(editingId, formData);
      } else {
        await api.createLocation(formData);
      }
      setFormData({ code: "", name: "", description: "" });
      setShowFormModal(false);
      setEditingId(null);
      loadLocations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "未知错误";
      if (errorMessage.includes('已存在')) {
        alert(errorMessage);
      } else {
        alert(`${editingId ? '更新' : '创建'}失败: ${errorMessage}`);
      }
    }
  };

  const handleEdit = (location: Location, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ 
      code: location.code, 
      name: location.name || "", 
      description: location.description || "" 
    });
    setEditingId(location.id);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`确定要删除盒子 "${code}" 吗？`)) return;
    
    try {
      await api.deleteLocation(id);
      loadLocations();
      if (selectedLocation?.id === id) {
        setSelectedLocation(null);
        setLocationParts([]);
      }
    } catch (err) {
      alert(`删除失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleViewParts = async (location: Location) => {
    try {
      const response = await api.getParts({ locationId: location.id });
      setLocationParts(response.data);
      setSelectedLocation(location);
      setShowPartsModal(true);
    } catch (err) {
      alert(`加载零件失败: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  const handleCancel = () => {
    setShowFormModal(false);
    setEditingId(null);
    setFormData({ code: "", name: "", description: "" });
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ code: "", name: "", description: "" });
    setShowFormModal(true);
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
            盒子管理
          </h2>
          <p style={{
            margin: `${spacing.xs} 0 0 0`,
            fontSize: typography.fontSize.sm,
            color: colors.gray600
          }}>
            {locations.length} 个盒子
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
          + 新建盒子
        </button>
      </div>

      {/* 位置列表 */}
      {locations.length === 0 ? (
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
              暂无盒子
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: typography.fontSize.sm, 
              color: colors.gray500
            }}>
              点击上方"新建盒子"按钮开始添加
            </p>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: spacing.xl 
        }}>
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleViewParts(location)}
              onMouseEnter={() => setHoveredCard(location.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative",
                background: colors.surface,
                border: `2px solid ${colors.gray200}`,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                cursor: "pointer",
                transition: transitions.base,
                boxShadow: hoveredCard === location.id ? shadows.lg : "none"
              }}
            >
              {/* 右上角操作按钮 - hover 显示 */}
              {hoveredCard === location.id && (
                <div style={{
                  position: "absolute",
                  top: spacing.sm,
                  right: spacing.sm,
                  display: "flex",
                  gap: spacing.xs
                }}>
                  {/* 编辑按钮 */}
                  <button
                    onClick={(e) => handleEdit(location, e)}
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
                      transition: transitions.fast,
                      boxShadow: shadows.sm
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
                    title="编辑盒子"
                  >
                    ✎
                  </button>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDelete(location.id, location.code, e)}
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
                    title="删除盒子"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* 左右布局：编号和零件数量 */}
              <div style={{
                display: "flex",
                gap: spacing.lg,
                marginBottom: location.description ? spacing.md : 0,
                paddingRight: spacing.xl
              }}>
                {/* 左侧：盒子编号 */}
                <div style={{
                  flex: "0 0 auto",
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: "48px",
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary,
                    lineHeight: 1,
                    marginBottom: spacing.xs,
                    letterSpacing: "0.02em"
                  }}>
                    {location.code}
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.gray600,
                    fontWeight: typography.fontWeight.medium
                  }}>
                    {location.name || ""}
                  </div>
                </div>

                {/* 右侧：零件数量 */}
                <div style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderLeft: `2px solid ${colors.gray200}`,
                  paddingLeft: spacing.lg
                }}>
                  <div style={{
                    fontSize: "40px",
                    fontWeight: typography.fontWeight.bold,
                    color: colors.accent,
                    lineHeight: 1,
                    marginBottom: spacing.xs
                  }}>
                    {partCounts[location.id] ?? 0}
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.gray600,
                    fontWeight: typography.fontWeight.medium
                  }}>
                    零件数量
                  </div>
                </div>
              </div>

              {/* 描述 */}
              {location.description && (
                <p style={{
                  margin: 0,
                  marginBottom: spacing.md,
                  fontSize: typography.fontSize.sm,
                  color: colors.gray600,
                  lineHeight: typography.lineHeight.relaxed
                }}>
                  {location.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 表单 Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={handleCancel}
        title={editingId ? "编辑盒子" : "新建盒子"}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          {/* 编号和名称并排 */}
          <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg }}>
            <div style={{ flex: "0 0 35%" }}>
              <label style={{
                display: "block",
                marginBottom: spacing.sm,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray700
              }}>
                盒子编号 *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="如: A1, TC23"
                required
                autoFocus
                maxLength={10}
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: `1px solid ${colors.gray300}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.primary,
                  backgroundColor: colors.surface,
                  outline: "none",
                  transition: transitions.base,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
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
              <div style={{
                marginTop: spacing.xs,
                fontSize: typography.fontSize.xs,
                color: colors.gray500
              }}>
                仅字母和数字
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: "block",
                marginBottom: spacing.sm,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.gray700
              }}>
                盒子名称（可选）
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入盒子名称"
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
              {editingId ? "保存修改" : "创建盒子"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 零件列表 Modal */}
      <Modal
        isOpen={showPartsModal}
        onClose={() => setShowPartsModal(false)}
        title={selectedLocation ? `盒子 ${selectedLocation.code}${selectedLocation.name ? ` (${selectedLocation.name})` : ""} 的零件` : "零件列表"}
        maxWidth="800px"
      >
        {locationParts.length === 0 ? (
          <div style={{ textAlign: "center", padding: spacing['3xl'], color: colors.gray500 }}>
            <p style={{ margin: 0, fontSize: typography.fontSize.base }}>该盒子下暂无零件</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            {locationParts.map((part) => (
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
}
