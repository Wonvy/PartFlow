import React, { useState } from "react";
import { colors, typography, spacing, borderRadius, shadows, transitions } from "../styles/design-system";

const API_BASE = "http://localhost:3333/api";

export function DataManager() {
  const [importing, setImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [importResult, setImportResult] = useState<any>(null);

  // 导出零件
  const handleExportParts = async (format: "csv" | "json") => {
    try {
      setExportStatus("正在导出零件...");
      const response = await fetch(`${API_BASE}/export/parts/${format}`);
      
      if (!response.ok) throw new Error("导出失败");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parts_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus("✓ 零件导出成功");
      setTimeout(() => setExportStatus(""), 3000);
    } catch (err) {
      setExportStatus("✗ 导出失败");
      console.error(err);
    }
  };

  // 导出分类
  const handleExportCategories = async (format: "csv" | "json") => {
    try {
      setExportStatus("正在导出分类...");
      const response = await fetch(`${API_BASE}/export/categories/${format}`);
      
      if (!response.ok) throw new Error("导出失败");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `categories_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus("✓ 分类导出成功");
      setTimeout(() => setExportStatus(""), 3000);
    } catch (err) {
      setExportStatus("✗ 导出失败");
      console.error(err);
    }
  };

  // 导出位置
  const handleExportLocations = async (format: "csv" | "json") => {
    try {
      setExportStatus("正在导出位置...");
      const response = await fetch(`${API_BASE}/export/locations/${format}`);
      
      if (!response.ok) throw new Error("导出失败");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `locations_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus("✓ 位置导出成功");
      setTimeout(() => setExportStatus(""), 3000);
    } catch (err) {
      setExportStatus("✗ 导出失败");
      console.error(err);
    }
  };

  // 导出全部数据
  const handleExportAll = async () => {
    try {
      setExportStatus("正在导出全部数据...");
      const response = await fetch(`${API_BASE}/export/all/json`);
      
      if (!response.ok) throw new Error("导出失败");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `partflow_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus("✓ 全部数据导出成功");
      setTimeout(() => setExportStatus(""), 3000);
    } catch (err) {
      setExportStatus("✗ 导出失败");
      console.error(err);
    }
  };

  // 导入零件 - JSON
  const handleImportPartsJson = async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      const json = JSON.parse(text);

      const response = await fetch(`${API_BASE}/import/parts/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: json.data || json })
      });

      const result = await response.json();
      setImportResult(result);
    } catch (err) {
      alert(`导入失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setImporting(false);
    }
  };

  // 导入零件 - CSV
  const handleImportPartsCsv = async (file: File) => {
    try {
      setImporting(true);
      const csvData = await file.text();

      const response = await fetch(`${API_BASE}/import/parts/csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData })
      });

      const result = await response.json();
      setImportResult(result);
    } catch (err) {
      alert(`导入失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setImporting(false);
    }
  };

  // 导入全部数据
  const handleImportAll = async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      const json = JSON.parse(text);

      const response = await fetch(`${API_BASE}/import/all/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      });

      const result = await response.json();
      setImportResult(result);
    } catch (err) {
      alert(`导入失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* 标题 */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: typography.fontSize['2xl'], 
          fontWeight: typography.fontWeight.semibold,
          color: colors.gray900
        }}>
          数据导入/导出
        </h2>
        <p style={{
          margin: `${spacing.xs} 0 0 0`,
          fontSize: typography.fontSize.sm,
          color: colors.gray600
        }}>
          备份和恢复您的数据
        </p>
      </div>

      {/* 状态提示 */}
      {exportStatus && (
        <div style={{
          marginBottom: spacing.xl,
          padding: spacing.lg,
          background: exportStatus.startsWith("✓") ? `${colors.success}15` : `${colors.error}15`,
          border: `1px solid ${exportStatus.startsWith("✓") ? colors.success : colors.error}30`,
          borderRadius: borderRadius.md,
          color: exportStatus.startsWith("✓") ? colors.success : colors.error,
          fontSize: typography.fontSize.sm
        }}>
          {exportStatus}
        </div>
      )}

      {/* 导出区域 */}
      <div style={{
        marginBottom: spacing['3xl'],
        padding: spacing.xl,
        background: colors.surface,
        border: `1px solid ${colors.gray200}`,
        borderRadius: borderRadius.lg
      }}>
        <h3 style={{
          margin: `0 0 ${spacing.lg} 0`,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.gray900
        }}>
          导出数据
        </h3>

        {/* 零件导出 */}
        <div style={{ marginBottom: spacing.lg }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.sm
          }}>
            <span style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700
            }}>
              零件数据
            </span>
            <div style={{ display: "flex", gap: spacing.sm }}>
              <button
                onClick={() => handleExportParts("csv")}
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
                CSV
              </button>
              <button
                onClick={() => handleExportParts("json")}
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
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* 分类导出 */}
        <div style={{ marginBottom: spacing.lg }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.sm
          }}>
            <span style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700
            }}>
              分类数据
            </span>
            <div style={{ display: "flex", gap: spacing.sm }}>
              <button
                onClick={() => handleExportCategories("csv")}
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
                CSV
              </button>
              <button
                onClick={() => handleExportCategories("json")}
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
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* 位置导出 */}
        <div style={{ marginBottom: spacing.lg }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.sm
          }}>
            <span style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray700
            }}>
              位置数据
            </span>
            <div style={{ display: "flex", gap: spacing.sm }}>
              <button
                onClick={() => handleExportLocations("csv")}
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
                CSV
              </button>
              <button
                onClick={() => handleExportLocations("json")}
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
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* 全部导出 */}
        <div style={{
          paddingTop: spacing.lg,
          borderTop: `1px solid ${colors.gray200}`
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray900,
                marginBottom: spacing.xs
              }}>
                完整备份
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray600
              }}>
                包含零件、分类、位置的所有数据
              </div>
            </div>
            <button
              onClick={handleExportAll}
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
              导出备份
            </button>
          </div>
        </div>
      </div>

      {/* 导入区域 */}
      <div style={{
        padding: spacing.xl,
        background: colors.surface,
        border: `1px solid ${colors.gray200}`,
        borderRadius: borderRadius.lg
      }}>
        <h3 style={{
          margin: `0 0 ${spacing.lg} 0`,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.gray900
        }}>
          导入数据
        </h3>

        <div style={{
          marginBottom: spacing.lg,
          padding: spacing.lg,
          background: `${colors.warning}10`,
          border: `1px solid ${colors.warning}30`,
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.sm,
          color: colors.gray700
        }}>
          ⚠️ 导入数据将添加到现有数据中，不会删除现有记录。请确保数据格式正确。
        </div>

        {/* 零件导入 */}
        <div style={{ marginBottom: spacing.lg }}>
          <label style={{
            display: "block",
            marginBottom: spacing.sm,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.gray700
          }}>
            导入零件
          </label>
          <div style={{ display: "flex", gap: spacing.sm }}>
            <input
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && handleImportPartsJson(e.target.files[0])}
              style={{ display: "none" }}
              id="import-parts-json"
            />
            <label
              htmlFor="import-parts-json"
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
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.gray100)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.surface)}
            >
              选择 JSON 文件
            </label>
            
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleImportPartsCsv(e.target.files[0])}
              style={{ display: "none" }}
              id="import-parts-csv"
            />
            <label
              htmlFor="import-parts-csv"
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
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.gray100)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.surface)}
            >
              选择 CSV 文件
            </label>
          </div>
        </div>

        {/* 完整备份导入 */}
        <div style={{
          paddingTop: spacing.lg,
          borderTop: `1px solid ${colors.gray200}`
        }}>
          <label style={{
            display: "block",
            marginBottom: spacing.sm,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.gray900
          }}>
            导入完整备份
          </label>
          <input
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && handleImportAll(e.target.files[0])}
            style={{ display: "none" }}
            id="import-all"
          />
          <label
            htmlFor="import-all"
            style={{
              display: "inline-block",
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
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryLight)}
            onMouseLeave={(e) => (e.currentTarget.style.background = colors.primary)}
          >
            选择备份文件
          </label>
        </div>
      </div>

      {/* 导入结果 */}
      {importResult && (
        <div style={{
          marginTop: spacing.xl,
          padding: spacing.xl,
          background: colors.surface,
          border: `1px solid ${colors.gray200}`,
          borderRadius: borderRadius.lg
        }}>
          <h4 style={{
            margin: `0 0 ${spacing.md} 0`,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.gray900
          }}>
            导入结果
          </h4>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.gray700 }}>
            {importResult.categories && (
              <div style={{ marginBottom: spacing.sm }}>
                分类: 成功 {importResult.categories.success} 个, 失败 {importResult.categories.failed} 个
              </div>
            )}
            {importResult.locations && (
              <div style={{ marginBottom: spacing.sm }}>
                位置: 成功 {importResult.locations.success} 个, 失败 {importResult.locations.failed} 个
              </div>
            )}
            {importResult.parts && (
              <div style={{ marginBottom: spacing.sm }}>
                零件: 成功 {importResult.parts.success} 个, 失败 {importResult.parts.failed} 个
              </div>
            )}
            {importResult.success !== undefined && (
              <div style={{ marginBottom: spacing.sm }}>
                成功: {importResult.success} 个, 失败: {importResult.failed} 个
              </div>
            )}
            {importResult.errors && importResult.errors.length > 0 && (
              <details style={{ marginTop: spacing.md }}>
                <summary style={{ cursor: "pointer", color: colors.error }}>
                  查看错误 ({importResult.errors.length})
                </summary>
                <div style={{
                  marginTop: spacing.sm,
                  padding: spacing.md,
                  background: colors.gray50,
                  borderRadius: borderRadius.sm,
                  fontSize: typography.fontSize.xs,
                  maxHeight: "200px",
                  overflow: "auto"
                }}>
                  {importResult.errors.map((err: string, i: number) => (
                    <div key={i} style={{ marginBottom: spacing.xs }}>
                      {err}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
          <button
            onClick={() => {
              setImportResult(null);
              window.location.reload();
            }}
            style={{
              marginTop: spacing.lg,
              padding: `${spacing.sm} ${spacing.lg}`,
              background: colors.accent,
              color: colors.white,
              border: "none",
              borderRadius: borderRadius.md,
              cursor: "pointer",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}
          >
            刷新页面
          </button>
        </div>
      )}

      {importing && (
        <div style={{
          marginTop: spacing.xl,
          padding: spacing.xl,
          textAlign: "center",
          color: colors.gray600,
          fontSize: typography.fontSize.sm
        }}>
          正在导入数据...
        </div>
      )}
    </div>
  );
}

