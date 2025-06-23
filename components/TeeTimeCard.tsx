import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import type { TeeTime } from "@/types/index";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "./Card";

type TeeTimeCardProps = {
  booking: TeeTime;
};

export default function TeeTimeCard({ booking }: TeeTimeCardProps) {
  const date = new Date(booking.start_time);
  const formattedTime = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const formattedDay = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.time}>{formattedTime}</Text>
        <View style={styles.rightInfo}>
          <View style={styles.playersContainer}>
            <FontAwesome5 name="users" size={16} color={Colors.text} />
            <Text style={styles.playersText}>
              {booking.players_count} Player{booking.players_count > 1 ? "s" : ""}
            </Text>
          </View>
          {/* ADD THIS GUEST COUNT SECTION */}
          {booking.guest_count && booking.guest_count > 0 && (
            <View style={styles.guestContainer}>
              <FontAwesome5 name="user-plus" size={14} color="#FFA500" />
              <Text style={styles.guestText}>
                {booking.guest_count} Guest{booking.guest_count > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.day}>{formattedDay}</Text>
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
  day: {
    fontSize: 16,
    color: "#666",
  },
  rightInfo: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  playersContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  playersText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  // ADD THESE NEW STYLES:
  guestContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  guestText: {
    marginLeft: Spacing.xs,
    fontSize: 12,
    fontWeight: "600",
    color: "#856404",
  },
});
