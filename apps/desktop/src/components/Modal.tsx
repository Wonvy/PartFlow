import React, { useEffect } from "react";
import { colors, spacing, borderRadius, shadows, transitions, zIndex } from "../styles/design-system";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "600px" }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: zIndex.modal,
        padding: spacing.lg,
        overflowY: "auto"
      }}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          width: "100%",
          maxWidth,
          maxHeight: "calc(100vh - 32px)",
          overflow: "auto",
          animation: "modalFadeIn 0.2s ease-out",
          boxSizing: "border-box",
          margin: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing.xl,
            borderBottom: `1px solid ${colors.gray200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            backgroundColor: colors.surface,
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: colors.gray900,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: borderRadius.full,
              border: "none",
              background: "transparent",
              color: colors.gray600,
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray100;
              e.currentTarget.style.color = colors.gray900;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.gray600;
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: spacing.xl }}>{children}</div>

        <style>{`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

