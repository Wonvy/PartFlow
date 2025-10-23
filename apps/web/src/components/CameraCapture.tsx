import React, { useRef, useState, useEffect } from "react";

type CameraCaptureProps = {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
};

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isFrontCamera]);

  const startCamera = async () => {
    try {
      setError(null);
      
      // 停止之前的流
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("摄像头访问失败:", err);
      setError("无法访问摄像头，请检查权限设置");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // 设置 canvas 尺寸为视频实际尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制视频帧到 canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 转换为 base64
    const imageUrl = canvas.toDataURL("image/jpeg", 0.9);

    // 停止摄像头
    stopCamera();

    // 返回图片
    onCapture(imageUrl);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.95)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}
      >
        {error ? (
          <div style={{ textAlign: "center", color: "white" }}>
            <p style={{ fontSize: 18, marginBottom: 20 }}>❌ {error}</p>
            <button
              onClick={handleClose}
              style={{
                padding: "12px 24px",
                background: "white",
                color: "black",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16
              }}
            >
              关闭
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 640,
                background: "black",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 20
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block"
                }}
              />
              
              {/* 参考线 */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  height: "80%",
                  border: "2px dashed rgba(255,255,255,0.5)",
                  borderRadius: 8,
                  pointerEvents: "none"
                }}
              />

              {/* 提示文字 */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  color: "white",
                  fontSize: 14,
                  background: "rgba(0,0,0,0.5)",
                  padding: "8px 16px"
                }}
              >
                将零件放在虚线框内
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={capturePhoto}
                style={{
                  padding: "16px 32px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 50,
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.5)"
                }}
              >
                📸 拍照
              </button>

              <button
                onClick={switchCamera}
                style={{
                  padding: "16px 24px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: 50,
                  cursor: "pointer",
                  fontSize: 16
                }}
              >
                🔄 {isFrontCamera ? "后置" : "前置"}
              </button>

              <button
                onClick={handleClose}
                style={{
                  padding: "16px 24px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 50,
                  cursor: "pointer",
                  fontSize: 16
                }}
              >
                ✕ 关闭
              </button>
            </div>

            <p style={{ color: "white", fontSize: 12, marginTop: 20, textAlign: "center" }}>
              💡 提示：保持设备稳定，确保光线充足
            </p>
          </>
        )}
      </div>
    </div>
  );
}

