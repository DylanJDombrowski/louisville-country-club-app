// File: app/_layout.tsx

import AuthProvider, { useAuth } from "@/app/providers/AuthProvider";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Hide the splash screen once fonts are loaded and auth state is determined
    if (!loading) {
      SplashScreen.hideAsync();
    }

    // Wait until the auth state is fully loaded
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (session && !inTabsGroup) {
      // Redirect authenticated users to the main app (tabs) if they are not already there.
      router.replace("/(tabs)/home");
    } else if (!session && !inAuthGroup) {
      // Redirect unauthenticated users to the sign-in screen.
      router.replace("/sign-in");
    }
  }, [session, loading, segments, router]);

  return (
    <Stack>
      {/* The main tab navigator is nested inside the stack */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Define the modal screen with a modal presentation style */}
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Information" }}
      />

      {/* Define other screens that can be pushed onto the stack */}
      <Stack.Screen name="book-tee-time" options={{ title: "Book Tee Time" }} />
      <Stack.Screen name="book-dining" options={{ title: "Book Dining" }} />

      {/* Define authentication screens, hiding the header for a custom UI */}
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // You can add custom fonts here if needed in the future
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null; // Return null while fonts are loading, Splash Screen is visible
  }

  return (
    // The AuthProvider wraps the entire app, making auth state available everywhere
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
