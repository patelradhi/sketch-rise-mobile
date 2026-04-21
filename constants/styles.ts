/**
 * Shared inline styles for components where className doesn't work.
 *
 * WHY THIS EXISTS:
 * react-native-css (NativeWind v5's engine) crashes when processing
 * certain CSS properties on TextInput on native. Its nativeStyleMapping()
 * function can't handle border shorthand + rgba() color tokens, and
 * returns undefined — causing "path.split is not a function".
 *
 * SOLUTION: Use style prop for TextInput, className for View/Text.
 * These constants keep styles DRY across sign-in and sign-up screens.
 */

import type { TextStyle, ViewStyle } from 'react-native';

const COLORS = {
	primary: '#F5F0E8',
	border: 'rgba(245, 158, 11, 0.15)',
	placeholder: 'rgba(245, 240, 232, 0.3)',
} as const;

export const inputFieldStyle: ViewStyle & TextStyle = {
	borderWidth: 1,
	borderColor: COLORS.border,
	borderRadius: 12,
	paddingHorizontal: 16,
	paddingVertical: 12,
	marginBottom: 12,
	color: COLORS.primary,
	fontFamily: 'sans-regular',
	fontSize: 16,
};

export const inputCodeStyle: ViewStyle & TextStyle = {
	...inputFieldStyle,
	textAlign: 'center',
	fontSize: 24,
	letterSpacing: 8,
	fontFamily: 'sans-bold',
};

export const PLACEHOLDER_COLOR = COLORS.placeholder;
