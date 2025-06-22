import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "./Card"; // Reusing our generic Card component

// Define the shape of our Announcement data
export type Announcement = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

type AnnouncementCardProps = {
  announcement: Announcement;
};

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  // Format the date for display
  const formattedDate = new Date(announcement.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.date}>{formattedDate}</Text>
      <View style={styles.divider} />
      <Text style={styles.content}>{announcement.content}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.sm,
  },
  content: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
