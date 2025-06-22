import { useAuth } from "@/app/providers/AuthProvider";
import TeeTimeCard from "@/components/TeeTimeCard";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import type { TeeTime } from "@/types/index";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TeeTimesScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<TeeTime[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("tee_times")
      .select("*")
      .eq("user_id", session.user.id)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [session])
  );

  if (loading) {
    return (
      <View style={stylesTeeTimes.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={stylesTeeTimes.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TeeTimeCard booking={item} />}
        contentContainerStyle={stylesTeeTimes.list}
        ListHeaderComponent={<Text style={stylesTeeTimes.headerTitle}>My Tee Times</Text>}
        ListEmptyComponent={
          <View style={stylesTeeTimes.centered}>
            <Text>You have no upcoming tee times.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} />}
      />
      <TouchableOpacity style={stylesTeeTimes.fab} onPress={() => router.push("/book-tee-time" as any)}>
        <FontAwesome5 name="plus" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const stylesTeeTimes = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F5F5F5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
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
