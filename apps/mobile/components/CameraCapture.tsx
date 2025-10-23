import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

type CameraCaptureProps = {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
};

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 权限未加载
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 权限未授予
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>📷 需要相机权限</Text>
          <Text style={styles.permissionHint}>
            PartFlow 需要访问您的相机来拍摄零件照片
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>授予权限</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false
      });

      if (photo && photo.uri) {
        onCapture(photo.uri);
      }
    } catch (error) {
      console.error("拍照失败:", error);
      Alert.alert("拍照失败", "无法保存照片，请重试");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* 顶部工具栏 */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={onClose}>
            <Text style={styles.topButtonText}>✕ 关闭</Text>
          </TouchableOpacity>
        </View>

        {/* 参考线 */}
        <View style={styles.guideline}>
          <View style={styles.guidelineInner} />
          <Text style={styles.guidelineText}>📷 将零件放在框内</Text>
        </View>

        {/* 底部控制栏 */}
        <View style={styles.controls}>
          <View style={styles.controlsInner}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipButtonText}>🔄</Text>
              <Text style={styles.flipButtonLabel}>
                {facing === "back" ? "前置" : "后置"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
          
          <Text style={styles.hint}>💡 保持设备稳定，确保光线充足</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black"
  },
  camera: {
    flex: 1
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32
  },
  permissionText: {
    fontSize: 24,
    color: "white",
    marginBottom: 16,
    textAlign: "center"
  },
  permissionHint: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24
  },
  permissionButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  permissionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600"
  },
  closeButton: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600"
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    paddingTop: 48,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  topButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20
  },
  topButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },
  guideline: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32
  },
  guidelineInner: {
    width: "100%",
    height: "80%",
    maxHeight: 400,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderStyle: "dashed",
    borderRadius: 12
  },
  guidelineText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  controls: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingBottom: 32,
    paddingTop: 20
  },
  controlsInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 32,
    marginBottom: 12
  },
  flipButton: {
    alignItems: "center",
    width: 60
  },
  flipButtonText: {
    fontSize: 32,
    marginBottom: 4
  },
  flipButtonLabel: {
    color: "white",
    fontSize: 12
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)"
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#2563eb"
  },
  placeholder: {
    width: 60
  },
  hint: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 32
  }
});

