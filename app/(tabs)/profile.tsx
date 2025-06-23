import { useAuth } from "@/app/providers/AuthProvider";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("full_name").eq("id", session.user.id).single();

    if (error) {
      Alert.alert("Error", "Could not fetch profile information.");
      console.error("Error fetching profile:", error.message);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The AuthProvider and root _layout will handle the redirect
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
      <Card>
        <View style={styles.infoContainer}>
          <FontAwesome5 name="user-circle" size={24} color={Colors.text} />
          <Text style={styles.infoText}>{profile?.full_name || "Name not set"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoContainer}>
          <FontAwesome name="envelope" size={24} color={Colors.text} />
          <Text style={styles.infoText}>{session?.user.email}</Text>
        </View>
      </Card>

      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  infoText: {
    fontSize: 18,
    marginLeft: Spacing.md,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.sm,
  },
});
