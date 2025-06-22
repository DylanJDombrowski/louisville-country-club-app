import { Colors } from "@/constants/Colors";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AuthProvider, { useAuth } from "./providers/AuthProvider";

const InitialLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if the user is in the main '(tabs)' group
    const inTabsGroup = segments[0] === "(tabs)";

    if (session && !inTabsGroup) {
      // Redirect to the main app home screen
      router.replace("/(tabs)/home");
    } else if (!session) {
      // Redirect to the sign-in screen
      router.replace("/sign-in" as any);
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
