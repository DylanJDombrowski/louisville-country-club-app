import AnnouncementCard, { type Announcement } from "@/components/AnnoucementCard";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error.message);
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.headerTitle}>Club News</Text>}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No announcements at this time.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F5F5F5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
});
