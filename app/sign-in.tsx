import Button from "@/components/Button";
import Input from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Login Error", error.message);
    }
    // The AuthProvider will handle the redirect on successful login
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.header}>Welcome Back</Text>
        <Text style={styles.subHeader}>Sign in to access your club benefits.</Text>

        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <Button title="Sign In" loading={loading} onPress={handleLogin} />

        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Text style={styles.link} onPress={() => router.push("/sign-up" as any)}>
            Sign Up
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: Spacing.xl,
  },
  footerText: {
    textAlign: "center",
    color: Colors.text,
    marginTop: Spacing.md,
  },
  link: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
