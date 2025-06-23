import { useAuth } from "@/app/providers/AuthProvider";
import Card from "@/components/Card";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DiningReservation {
  id: string;
  reservation_datetime: string;
  party_size: number;
  status: string;
  guest_count: number;
  special_requests?: string;
  tables: {
    table_number: string;
    capacity: number;
    location: string;
    resources: {
      name: string;
    };
  };
}

export default function DiningScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<DiningReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("dining_reservations")
      .select(
        `
        id,
        reservation_datetime,
        party_size,
        status,
        guest_count,
        special_requests,
        tables (
          table_number,
          capacity,
          location,
          resources (
            name
          )
        )
      `
      )
      .eq("member_id", session.user.id)
      .gte("reservation_datetime", new Date().toISOString()) // Only future reservations
      .order("reservation_datetime", { ascending: true });

    if (error) {
      console.error("Error fetching dining reservations:", error.message);
    } else {
      // Map tables and resources to match the expected type
      setReservations(
        (data || []).map((reservation: any) => ({
          ...reservation,
          tables:
            Array.isArray(reservation.tables) && reservation.tables.length > 0
              ? {
                  ...reservation.tables[0],
                  resources:
                    Array.isArray(reservation.tables[0]?.resources) && reservation.tables[0].resources.length > 0
                      ? reservation.tables[0].resources[0]
                      : { name: "" },
                }
              : { table_number: "", capacity: 0, location: "", resources: { name: "" } },
        }))
      );
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [session])
  );

  const formatReservationDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const day = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
    return { time, day };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return Colors.primary;
      case "pending":
        return "#FFA500";
      case "cancelled":
        return Colors.error;
      default:
        return Colors.text;
    }
  };

  const renderReservationCard = ({ item }: { item: DiningReservation }) => {
    const { time, day } = formatReservationDateTime(item.reservation_datetime);

    return (
      <Card>
        <View style={styles.header}>
          <View>
            <Text style={styles.time}>{time}</Text>
            <Text style={styles.day}>{day}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <FontAwesome5 name="map-marker-alt" size={16} color={Colors.text} />
            <Text style={styles.detailText}>
              {item.tables.resources.name} - Table {item.tables.table_number}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome5 name="users" size={16} color={Colors.text} />
            <Text style={styles.detailText}>
              {item.party_size} guests
              {item.guest_count > 0 && ` (${item.guest_count} non-members)`}
            </Text>
          </View>

          {item.special_requests && (
            <View style={styles.detailRow}>
              <FontAwesome5 name="sticky-note" size={16} color={Colors.text} />
              <Text style={styles.detailText}>{item.special_requests}</Text>
            </View>
          )}
        </View>
      </Card>
    );
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
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservationCard}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.headerTitle}>My Dining Reservations</Text>}
        ListEmptyComponent={
          <View style={styles.centered}>
            <FontAwesome5 name="utensils" size={48} color="#ccc" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No upcoming dining reservations.</Text>
            <Text style={styles.emptySubtext}>Book a table to enjoy our exceptional dining experience.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReservations} />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/book-dining" as any)}>
        <FontAwesome5 name="plus" size={24} color={Colors.white} />
      </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  time: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  day: {
    fontSize: 16,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  details: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
