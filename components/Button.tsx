import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "default" | "destructive";
}

export default function Button({ title, loading, variant = "default", ...props }: ButtonProps) {
  const buttonVariantStyle = variant === "destructive" ? buttonStyles.destructiveButton : buttonStyles.defaultButton;
  return (
    <TouchableOpacity style={[buttonStyles.button, buttonVariantStyle]} disabled={loading} {...props}>
      {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={buttonStyles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  defaultButton: {
    backgroundColor: Colors.primary,
  },
  destructiveButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
