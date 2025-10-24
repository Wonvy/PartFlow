import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "./Modal";
import { colors, typography, spacing, borderRadius } from "../styles/design-system";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [networkUrls, setNetworkUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 获取当前访问的 URL
      const currentUrl = window.location.href;
      const protocol = window.location.protocol;
      const port = window.location.port;
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      
      // 收集所有可能的URL
      const urls: string[] = [];
      
      // 添加当前访问的URL
      urls.push(currentUrl);
      
      // 检查是否使用localhost
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(isLocal);
      
      // 如果当前是localhost，自动生成局域网IP的URL建议
      if (isLocal) {
        // 根据Vite显示的常见IP模式，提供建议的局域网地址
        // 用户需要根据实际情况选择
        const commonIPs = [
          '10.102.208.152',  // 从终端输出看到的IP
          '192.168.1.x',     // 常见的家用路由器IP
          '192.168.0.x',     // 另一个常见的IP段
          '10.0.0.x',        // 另一个常见的IP段
        ];
        
        // 添加提示信息
        urls.push('');  // 空行分隔
        urls.push('💡 建议使用局域网IP访问：');
        urls.push(`${protocol}//${commonIPs[0]}:${port}${pathname}${search}${hash}`);
      }
      
      setNetworkUrls(urls);
      setSelectedUrl(currentUrl);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="扫码访问">
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        gap: spacing.xl
      }}>
        {/* 二维码 */}
        <div style={{
          padding: spacing.xl,
          background: colors.white,
          borderRadius: borderRadius.lg,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
        }}>
          <QRCodeSVG 
            value={selectedUrl} 
            size={240}
            level="M"
            includeMargin={true}
          />
        </div>

        {/* URL 显示 */}
        <div style={{ textAlign: "center", width: "100%" }}>
          <p style={{
            margin: `0 0 ${spacing.sm} 0`,
            fontSize: typography.fontSize.sm,
            color: colors.gray600,
            fontWeight: typography.fontWeight.medium
          }}>
            使用手机扫描二维码访问
          </p>
          <div style={{
            padding: spacing.md,
            background: colors.gray100,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.xs,
            color: colors.gray700,
            fontFamily: "monospace",
            wordBreak: "break-all"
          }}>
            {selectedUrl}
          </div>
          <p style={{
            margin: `${spacing.md} 0 0 0`,
            fontSize: typography.fontSize.xs,
            color: colors.gray500
          }}>
            请确保手机和电脑在同一局域网
          </p>
        </div>

        {/* 可用网络地址列表 */}
        {networkUrls.length > 1 && (
          <div style={{
            width: "100%",
            padding: spacing.md,
            background: colors.gray50,
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.gray200}`
          }}>
            <p style={{
              margin: `0 0 ${spacing.sm} 0`,
              fontSize: typography.fontSize.xs,
              color: colors.gray600,
              fontWeight: typography.fontWeight.semibold
            }}>
              其他可用地址：
            </p>
            {networkUrls.slice(1).map((url, index) => {
              // 如果是空字符串，跳过
              if (!url) return null;
              
              // 如果是提示文本，特殊显示
              if (url.startsWith('💡')) {
                return (
                  <div
                    key={index}
                    style={{
                      padding: `${spacing.xs} 0`,
                      fontSize: typography.fontSize.xs,
                      color: colors.primary,
                      fontWeight: typography.fontWeight.semibold
                    }}
                  >
                    {url}
                  </div>
                );
              }
              
              // 如果是URL，显示为可点击的链接
              if (url.startsWith('http')) {
                return (
                  <div
                    key={index}
                    style={{
                      padding: spacing.xs,
                      fontSize: typography.fontSize.xs,
                      fontFamily: "monospace",
                    }}
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: colors.primary,
                        textDecoration: "none",
                        wordBreak: "break-all"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      • {url}
                    </a>
                  </div>
                );
              }
              
              return (
                <div
                  key={index}
                  style={{
                    padding: spacing.xs,
                    fontSize: typography.fontSize.xs,
                    color: colors.gray700,
                    fontFamily: "monospace",
                    wordBreak: "break-all"
                  }}
                >
                  • {url}
                </div>
              );
            })}
          </div>
        )}

        {/* 局域网访问提示 - 只在使用localhost时显示 */}
        {isLocalhost && (
          <div style={{
            width: "100%",
            padding: spacing.md,
            background: "#FFF9E6",
            borderRadius: borderRadius.md,
            border: "1px solid #FFE58F"
          }}>
            <p style={{
              margin: `0 0 ${spacing.sm} 0`,
              fontSize: typography.fontSize.xs,
              color: "#AD6800",
              fontWeight: typography.fontWeight.semibold
            }}>
              ⚠️ 当前使用 localhost，手机无法扫码访问
            </p>
            <p style={{
              margin: 0,
              fontSize: typography.fontSize.xs,
              color: colors.gray600,
              lineHeight: 1.6
            }}>
              请点击上方的建议地址（如 http://10.102.208.152:5173/），在新标签页打开后，再点击二维码图标生成可用的二维码。
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

