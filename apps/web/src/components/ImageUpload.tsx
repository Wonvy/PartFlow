import React, { useState, useRef, useEffect } from "react";
import { CameraCapture } from "./CameraCapture";

type ImageUploadProps = {
  value?: string;
  onChange: (imageUrl: string) => void;
};

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 监听剪贴板粘贴事件
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // 只在组件可见时处理
      if (!dropZoneRef.current) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
          }
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件！");
      return;
    }

    // 限制文件大小为 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB！");
      return;
    }

    setIsProcessing(true);

    try {
      // 将图片转换为 base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onChange(result);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert("图片读取失败！");
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("图片处理失败！");
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraCapture = (imageUrl: string) => {
    setPreview(imageUrl);
    onChange(imageUrl);
    setShowCamera(false);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
        aria-label="选择图片文件"
      />

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {preview ? (
        <div style={{ position: "relative" }}>
          <img
            src={preview}
            alt="预览"
            style={{
              width: "100%",
              maxWidth: 400,
              maxHeight: 300,
              objectFit: "contain",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb"
            }}
          />
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "6px 12px",
                fontSize: 13,
                border: "1px solid #2563eb",
                background: "white",
                color: "#2563eb",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              📁 更换图片
            </button>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              style={{
                padding: "6px 12px",
                fontSize: 13,
                border: "1px solid #059669",
                background: "white",
                color: "#059669",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              📷 拍照
            </button>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                padding: "6px 12px",
                fontSize: 13,
                border: "1px solid #dc2626",
                background: "white",
                color: "#dc2626",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              🗑️ 删除
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#2563eb" : "#d1d5db"}`,
            borderRadius: 8,
            padding: 32,
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "#eff6ff" : "#f9fafb",
            transition: "all 0.2s"
          }}
        >
          {isProcessing ? (
            <div>
              <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>处理中...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
              <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#374151", fontWeight: 500 }}>
                点击选择图片
              </p>
              <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#6b7280" }}>
                或拖拽图片到此处
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                💡 提示：也可以直接 Ctrl+V 粘贴剪贴板中的图片
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCamera(true);
                }}
                style={{
                  marginTop: 12,
                  padding: "8px 20px",
                  fontSize: 14,
                  background: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                📷 使用相机拍照
              </button>
              <p style={{ margin: "12px 0 0 0", fontSize: 11, color: "#9ca3af" }}>
                支持 JPG、PNG、GIF，最大 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

