import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal
} from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { CameraCapture } from "./CameraCapture";

type ImagePickerProps = {
  value?: string;
  onChange: (imageUri: string) => void;
};

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [showCamera, setShowCamera] = useState(false);

  const pickImage = async () => {
    try {
      // 请求权限
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("需要权限", "请授予访问相册的权限");
        return;
      }

      // 选择图片
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("选择图片失败:", error);
      Alert.alert("错误", "无法选择图片");
    }
  };

  const handleCameraCapture = (imageUri: string) => {
    onChange(imageUri);
    setShowCamera(false);
  };

  const handleRemove = () => {
    Alert.alert(
      "删除图片",
      "确定要删除这张图片吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => onChange("")
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {value ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
              <Text style={styles.changeButtonText}>📁 更换</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(true)}>
              <Text style={styles.cameraButtonText}>📷 拍照</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
              <Text style={styles.removeButtonText}>🗑️ 删除</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>添加零件图片</Text>
            <Text style={styles.placeholderHint}>支持 JPG、PNG、GIF</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                <Text style={styles.pickButtonText}>📁 从相册选择</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => setShowCamera(true)}
              >
                <Text style={styles.captureButtonText}>📷 拍照</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  previewContainer: {
    alignItems: "center"
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginBottom: 12
  },
  placeholderContainer: {
    width: "100%"
  },
  placeholder: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    minHeight: 200,
    justifyContent: "center"
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  placeholderText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6
  },
  placeholderHint: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center"
  },
  pickButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140
  },
  pickButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  },
  captureButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100
  },
  captureButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  },
  changeButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  changeButtonText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600"
  },
  cameraButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  cameraButtonText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "600"
  },
  removeButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  removeButtonText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600"
  }
});

