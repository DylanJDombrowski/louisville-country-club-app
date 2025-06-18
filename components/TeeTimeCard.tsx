// components/TeeTimeCard.tsx
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import type { TeeTime } from "@/types";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "./Card";

type TeeTimeCardProps = {
  teeTime: TeeTime;
};

export default function TeeTimeCard({ teeTime }: TeeTimeCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.time}>{teeTime.time}</Text>
        <View style={[styles.status, { backgroundColor: teeTime.isConfirmed ? Colors.primary : "#FFA726" }]}>
          <Text style={styles.statusText}>{teeTime.isConfirmed ? "Confirmed" : "Pending"}</Text>
        </View>
      </View>
      <Text style={styles.day}>{teeTime.day}</Text>
      <View style={styles.divider} />
      <View style={styles.playersContainer}>
        <FontAwesome5 name="users" size={16} color={Colors.text} />
        <Text style={styles.playersText}>{teeTime.players.join(", ")}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  time: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  status: {
    borderRadius: 12,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  statusText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 12,
  },
  day: {
    fontSize: 16,
    color: "#666",
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.sm,
  },
  playersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  playersText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
  },
});
