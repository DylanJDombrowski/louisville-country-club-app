// app/(tabs)/_layout.tsx
import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
      }}
    >
      {/* This sets the Tee Times tab as the default screen for the (tabs) layout */}
      <Tabs.Screen name="index" options={{ href: null }} />

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tee-times"
        options={{
          title: "Tee Times",
          tabBarIcon: ({ color }) => <FontAwesome5 name="golf-ball" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dining"
        options={{
          title: "Dining",
          tabBarIcon: ({ color }) => <FontAwesome5 name="utensils" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
