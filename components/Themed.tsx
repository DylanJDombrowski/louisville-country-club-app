import { Colors } from "@/constants/Colors"; // Corrected capitalization
import { Text as DefaultText, View as DefaultView, type TextProps, type ViewProps } from "react-native";
import { useColorScheme } from "./useColorScheme";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

// This type helps define the color names we can use from our Colors object.
type ColorName = keyof typeof Colors;

export function useThemeColor(props: { light?: string; dark?: string }, colorName: ColorName) {
  // Determine the current theme (light or dark), defaulting to 'light'.
  const theme = useColorScheme() ?? "light";
  // Check if a specific color for the current theme was passed in as a prop.
  const colorFromProps = props[theme];

  // If a color was passed as a prop (e.g., lightColor or darkColor), use it.
  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Otherwise, return the default color from our main Colors.ts file.
    // Note: Since our current Colors.ts doesn't have separate light/dark modes,
    // this will always pull from the same set of colors for now.
    return Colors[colorName];
  }
}

export function Text(props: TextProps & ThemeProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps & ThemeProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
