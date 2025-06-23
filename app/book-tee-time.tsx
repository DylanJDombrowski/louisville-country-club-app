import { useAuth } from "@/app/providers/AuthProvider";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

// Helper function to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 6; h < 19; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};

export default function BookTeeTimeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  // We will manage date as a string 'YYYY-MM-DD' for simplicity
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [players, setPlayers] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [guestCount, setGuestCount] = useState("0");

  const allPossibleSlots = generateTimeSlots();

  useEffect(() => {
    if (selectedDate) {
      fetchTeeTimesForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchTeeTimesForDate = async (dateStr: string) => {
    setLoadingSlots(true);
    setSelectedTime(null);

    const date = new Date(dateStr);
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const { data, error } = await supabase
      .from("tee_times")
      .select("start_time")
      .gte("start_time", startDate.toISOString())
      .lt("start_time", endDate.toISOString());

    if (error) {
      Alert.alert("Error", "Could not fetch available tee times.");
      console.error(error);
      setAvailableSlots([]);
    } else {
      const bookedTimes = data.map((d) => new Date(d.start_time).toTimeString().substring(0, 5));
      const now = new Date();
      const isToday = now.toDateString() === new Date(dateStr + "T00:00:00").toDateString();

      const filteredSlots = allPossibleSlots.filter((slot) => {
        const [hour, minute] = slot.split(":").map(Number);
        const slotTimeToday = new Date();
        slotTimeToday.setHours(hour, minute, 0, 0);

        const isPast = isToday && now > slotTimeToday;
        return !bookedTimes.includes(slot) && !isPast;
      });
      setAvailableSlots(filteredSlots);
    }
    setLoadingSlots(false);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Error", "Please select both a date and a time.");
      return;
    }

    const startTimeISO = `${selectedDate}T${selectedTime}:00`;
    setLoading(true);

    const { error } = await supabase.from("tee_times").insert({
      user_id: session?.user.id,
      start_time: startTimeISO,
      players_count: parseInt(players, 10) || 1,
      guest_count: parseInt(guestCount, 10) || 0,
      notes: notes,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Booking Error", error.message);
    } else {
      Alert.alert("Success", "Your tee time has been booked!");
      router.back();
    }
  };

  // This function would ideally open a calendar picker
  const handleSelectDate = () => {
    // For this example, we'll just set it to today.
    // In a real app, you'd use a calendar component.
    const today = new Date();
    // AC2: Prevent selecting past dates (handled by calendar component ideally)
    const todayStr = today.toISOString().split("T")[0];
    setSelectedDate(todayStr); // Example: set to today
    Alert.alert("Date Selected", `Showing times for ${todayStr}. A full calendar would be used here.`);
  };

  return (
    <ScrollView style={stylesBooking.container} contentContainerStyle={stylesBooking.inner}>
      <Text style={stylesBooking.header}>Book a Tee Time</Text>

      {/* AC1: Select date from a calendar interface */}
      <Text style={stylesBooking.label}>Date</Text>
      <TouchableOpacity style={stylesBooking.dateButton} onPress={handleSelectDate}>
        <Text style={stylesBooking.dateButtonText}>{selectedDate || "Select a Date"}</Text>
      </TouchableOpacity>

      {/* AC3: Presented with a list of available time slots */}
      {selectedDate && (
        <>
          <Text style={stylesBooking.label}>Available Times</Text>
          {loadingSlots ? (
            <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={Colors.primary} />
          ) : (
            <FlatList
              data={availableSlots}
              numColumns={4}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[stylesBooking.timeSlot, selectedTime === item && stylesBooking.selectedTimeSlot]}
                  onPress={() => setSelectedTime(item)}
                >
                  <Text style={[stylesBooking.timeSlotText, selectedTime === item && stylesBooking.selectedTimeSlotText]}>
                    {new Date(`1970-01-01T${item}`).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: "center", marginVertical: 20 }}>No available times for this date.</Text>}
            />
          )}
        </>
      )}

      <Text style={stylesBooking.label}>Number of Players</Text>
      <Input placeholder="1" value={players} onChangeText={setPlayers} keyboardType="number-pad" />

      <Text style={stylesBooking.label}>Non-Member Guests</Text>
      <Input placeholder="Number of guests (fees may apply)" value={guestCount} onChangeText={setGuestCount} keyboardType="number-pad" />

      <Text style={stylesBooking.label}>Notes (Optional)</Text>
      <Input placeholder="e.g., Requesting cart, specific caddie" value={notes} onChangeText={setNotes} multiline />

      <Button
        title="Confirm Booking"
        loading={loading}
        onPress={handleBooking}
        disabled={!selectedDate || !selectedTime || loading} // AC6
      />
    </ScrollView>
  );
}

const stylesBooking = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    padding: Spacing.lg,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  dateButton: {
    backgroundColor: "#F6F6F6",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  timeSlot: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  selectedTimeSlot: {
    backgroundColor: Colors.primary,
  },
  timeSlotText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  selectedTimeSlotText: {
    color: Colors.white,
  },
});
