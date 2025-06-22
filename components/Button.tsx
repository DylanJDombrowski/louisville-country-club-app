import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export default function Button({ title, loading, ...props }: ButtonProps) {
  return (
    <TouchableOpacity style={buttonStyles.button} disabled={loading} {...props}>
      {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={buttonStyles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
