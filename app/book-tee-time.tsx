import { useAuth } from "@/app/providers/AuthProvider";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";

export default function BookTeeTimeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM (24h format)
  const [players, setPlayers] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!date || !time) {
      Alert.alert("Error", "Please enter both a date and time.");
      return;
    }

    // Combine date and time into a valid ISO 8601 string
    const startTimeISO = `${date}T${time}:00`;
    setLoading(true);

    const { error } = await supabase.from("tee_times").insert({
      user_id: session?.user.id,
      start_time: startTimeISO,
      players_count: parseInt(players, 10),
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

  return (
    <ScrollView style={stylesBooking.container} contentContainerStyle={stylesBooking.inner}>
      <Text style={stylesBooking.header}>Book a Tee Time</Text>

      <Text style={stylesBooking.label}>Date</Text>
      <Input placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />

      <Text style={stylesBooking.label}>Time</Text>
      <Input placeholder="HH:MM (e.g., 08:30 or 14:00)" value={time} onChangeText={setTime} />

      <Text style={stylesBooking.label}>Number of Players</Text>
      <Input placeholder="1" value={players} onChangeText={setPlayers} keyboardType="number-pad" />

      <Text style={stylesBooking.label}>Notes (Optional)</Text>
      <Input placeholder="e.g., Requesting cart, specific caddie" value={notes} onChangeText={setNotes} multiline />

      <Button title="Confirm Booking" loading={loading} onPress={handleBooking} />
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
    marginTop: Spacing.sm,
  },
});
