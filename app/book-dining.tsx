// app/book-dining.tsx
import { useAuth } from "@/app/providers/AuthProvider";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DiningVenue {
  id: string;
  name: string;
  description: string;
  capacity: number;
}

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  location: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookDiningScreen() {
  const { session } = useAuth();
  const router = useRouter();

  // Form state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<DiningVenue | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [partySize, setPartySize] = useState("2");
  const [guestCount, setGuestCount] = useState("0");
  const [specialRequests, setSpecialRequests] = useState("");

  // Data state
  const [venues, setVenues] = useState<DiningVenue[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch dining venues on mount
  useEffect(() => {
    fetchVenues();
  }, []);

  // Fetch venues when selected venue changes
  useEffect(() => {
    if (selectedVenue && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedVenue, selectedDate]);

  // Fetch tables when venue and time are selected
  useEffect(() => {
    if (selectedVenue && selectedTime && selectedDate) {
      fetchAvailableTables();
    }
  }, [selectedVenue, selectedTime, selectedDate]);

  const fetchVenues = async () => {
    setLoadingVenues(true);
    const { data, error } = await supabase
      .from("resources")
      .select("id, name, description, capacity")
      .eq("resource_type", "dining")
      .eq("active", true)
      .order("name");

    if (error) {
      console.error("Error fetching venues:", error.message);
      Alert.alert("Error", "Could not load dining venues.");
    } else {
      setVenues(data || []);
    }
    setLoadingVenues(false);
  };

  const fetchTimeSlots = async () => {
    if (!selectedVenue || !selectedDate) return;

    setLoadingSlots(true);
    try {
      // Call the database function to get time slots
      const { data, error } = await supabase.rpc("get_dining_time_slots", {
        venue_id: selectedVenue.id,
        reservation_date: selectedDate,
      });

      if (error) {
        console.error("Error fetching time slots:", error.message);
        // Fallback to generating time slots manually
        generateTimeSlots();
      } else {
        const slots = data.map((slot: any) => ({
          time: slot.time_slot,
          available: slot.available_tables_count > 0,
        }));
        setTimeSlots(slots);
      }
    } catch (err) {
      console.error("Error calling time slots function:", err);
      generateTimeSlots();
    }
    setLoadingSlots(false);
  };

  const generateTimeSlots = () => {
    // Fallback: generate time slots manually
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = selectedDate === now.toISOString().split("T")[0];

    for (let hour = 11; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Skip past times if it's today
        if (isToday) {
          const slotTime = new Date();
          slotTime.setHours(hour, minute, 0, 0);
          if (slotTime <= now) continue;
        }

        slots.push({
          time: timeStr,
          available: true, // We'll assume available for fallback
        });
      }
    }
    setTimeSlots(slots);
  };

  const fetchAvailableTables = async () => {
    if (!selectedVenue || !selectedTime || !selectedDate) return;

    setLoadingTables(true);
    const reservationDateTime = `${selectedDate}T${selectedTime}:00`;
    const partyNum = parseInt(partySize) || 2;

    try {
      // Call the database function to get available tables
      const { data, error } = await supabase.rpc("get_available_tables", {
        venue_id: selectedVenue.id,
        reservation_start: reservationDateTime,
        duration_mins: 120,
        min_capacity: partyNum,
      });

      if (error) {
        console.error("Error fetching available tables:", error.message);
        // Fallback to fetching all tables
        fetchAllTables();
      } else {
        setTables(data || []);
      }
    } catch (err) {
      console.error("Error calling available tables function:", err);
      fetchAllTables();
    }
    setLoadingTables(false);
  };

  const fetchAllTables = async () => {
    // Fallback: get all tables for the venue
    const { data, error } = await supabase
      .from("tables")
      .select("id, table_number, capacity, location")
      .eq("resource_id", selectedVenue?.id)
      .eq("active", true)
      .gte("capacity", parseInt(partySize) || 2)
      .order("table_number");

    if (error) {
      console.error("Error fetching tables:", error.message);
      setTables([]);
    } else {
      setTables(data || []);
    }
  };

  const handleSelectDate = () => {
    // Simple date selection - in production, you'd use a proper date picker
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    Alert.alert("Select Date", "Choose a date for your reservation:", [
      { text: "Today", onPress: () => setSelectedDate(today.toISOString().split("T")[0]) },
      { text: "Tomorrow", onPress: () => setSelectedDate(tomorrow.toISOString().split("T")[0]) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleBooking = async () => {
    if (!selectedVenue || !selectedTable || !selectedTime || !selectedDate) {
      Alert.alert("Error", "Please complete all required fields.");
      return;
    }

    setLoading(true);
    const reservationDateTime = `${selectedDate}T${selectedTime}:00`;

    const { error } = await supabase.from("dining_reservations").insert({
      member_id: session?.user.id,
      table_id: selectedTable.id,
      reservation_datetime: reservationDateTime,
      party_size: parseInt(partySize) || 2,
      guest_count: parseInt(guestCount) || 0,
      special_requests: specialRequests || null,
      duration_minutes: 120,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Booking Error", error.message);
    } else {
      Alert.alert("Success", "Your dining reservation has been booked!");
      router.back();
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loadingVenues) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dining venues...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.header}>Reserve a Table</Text>

      {/* Step 1: Select Venue */}
      <Text style={styles.sectionTitle}>1. Select Dining Venue</Text>
      <View style={styles.venueContainer}>
        {venues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={[styles.venueCard, selectedVenue?.id === venue.id && styles.selectedVenueCard]}
            onPress={() => {
              setSelectedVenue(venue);
              setSelectedTime(null);
              setSelectedTable(null);
              setTables([]);
            }}
          >
            <Text style={[styles.venueName, selectedVenue?.id === venue.id && styles.selectedVenueText]}>{venue.name}</Text>
            {venue.description && <Text style={styles.venueDescription}>{venue.description}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Step 2: Select Date */}
      {selectedVenue && (
        <>
          <Text style={styles.sectionTitle}>2. Select Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={handleSelectDate}>
            <FontAwesome5 name="calendar-alt" size={20} color={Colors.primary} />
            <Text style={styles.dateButtonText}>
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a Date"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Step 3: Party Size */}
      {selectedDate && (
        <>
          <Text style={styles.sectionTitle}>3. Party Information</Text>
          <Text style={styles.label}>Party Size</Text>
          <Input placeholder="Number of people" value={partySize} onChangeText={setPartySize} keyboardType="number-pad" />

          <Text style={styles.label}>Non-Member Guests</Text>
          <Input
            placeholder="Number of guests (fees may apply)"
            value={guestCount}
            onChangeText={setGuestCount}
            keyboardType="number-pad"
          />
        </>
      )}

      {/* Step 4: Select Time */}
      {selectedVenue && selectedDate && partySize && (
        <>
          <Text style={styles.sectionTitle}>4. Select Time</Text>
          {loadingSlots ? (
            <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={timeSlots}
              numColumns={3}
              keyExtractor={(item) => item.time}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeSlot,
                    selectedTime === item.time && styles.selectedTimeSlot,
                    !item.available && styles.unavailableTimeSlot,
                  ]}
                  onPress={() => (item.available ? setSelectedTime(item.time) : null)}
                  disabled={!item.available}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === item.time && styles.selectedTimeSlotText,
                      !item.available && styles.unavailableTimeSlotText,
                    ]}
                  >
                    {formatTime(item.time)}
                  </Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          )}
        </>
      )}

      {/* Step 5: Select Table */}
      {selectedTime && (
        <>
          <Text style={styles.sectionTitle}>5. Select Table</Text>
          {loadingTables ? (
            <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={Colors.primary} />
          ) : tables.length > 0 ? (
            <FlatList
              data={tables}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.tableCard, selectedTable?.id === item.id && styles.selectedTableCard]}
                  onPress={() => setSelectedTable(item)}
                >
                  <View style={styles.tableInfo}>
                    <Text style={styles.tableNumber}>Table {item.table_number}</Text>
                    <Text style={styles.tableDetails}>
                      {item.location} • Seats {item.capacity}
                    </Text>
                  </View>
                  {selectedTable?.id === item.id && <FontAwesome5 name="check-circle" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noTablesText}>No tables available for your party size at this time.</Text>
          )}
        </>
      )}

      {/* Step 6: Special Requests */}
      {selectedTable && (
        <>
          <Text style={styles.sectionTitle}>6. Special Requests (Optional)</Text>
          <Input
            placeholder="Dietary restrictions, seating preferences, etc."
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
          />
        </>
      )}

      {/* Booking Button */}
      {selectedTable && <Button title="Confirm Reservation" loading={loading} onPress={handleBooking} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    padding: Spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  venueContainer: {
    gap: Spacing.sm,
  },
  venueCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedVenueCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  venueName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  selectedVenueText: {
    color: Colors.primary,
  },
  venueDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  timeSlot: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  selectedTimeSlot: {
    backgroundColor: Colors.primary,
  },
  unavailableTimeSlot: {
    backgroundColor: "#e0e0e0",
  },
  timeSlotText: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 12,
  },
  selectedTimeSlotText: {
    color: Colors.white,
  },
  unavailableTimeSlotText: {
    color: "#999",
  },
  tableCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedTableCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  tableInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  tableDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  noTablesText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: Spacing.lg,
  },
});
