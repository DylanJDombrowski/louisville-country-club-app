// app/(tabs)/tee-times.tsx
import TeeTimeCard from "@/components/TeeTimeCard";
import { Colors } from "@/constants/Colors";
import { MOCK_TEE_TIMES } from "@/constants/mockData";
import { Spacing } from "@/constants/spacing";
import { FontAwesome5 } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TeeTimesScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_TEE_TIMES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TeeTimeCard teeTime={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.headerTitle}>Your Upcoming Tee Times</Text>}
      />
      <TouchableOpacity style={styles.fab}>
        <FontAwesome5 name="plus" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});
