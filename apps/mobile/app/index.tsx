import { View, Text, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PartFlow Mobile</Text>
      <Text style={styles.subtitle}>跨平台零件管理系统 · 移动端</Text>
      <Text style={styles.description}>支持：拍照录入、扫码管理</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4
  },
  description: {
    fontSize: 14,
    color: "#999"
  }
});

