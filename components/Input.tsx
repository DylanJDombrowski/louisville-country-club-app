import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/spacing";
import React from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

export default function Input(props: TextInputProps) {
  return <TextInput style={styles.input} placeholderTextColor="#A9A9A9" {...props} />;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#F6F6F6",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    marginVertical: Spacing.sm,
  },
});
