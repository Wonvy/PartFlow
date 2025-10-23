import React, { useEffect, useState } from "react";
import type { Part } from "@partflow/core";
import { api } from "../api/client";

export function PartsList() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getParts({ search: search || undefined });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="搜索零件..."
          style={{
            flex: 1,
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
            cursor: "pointer"
          }}
        >
          搜索
        </button>
      </div>

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
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

