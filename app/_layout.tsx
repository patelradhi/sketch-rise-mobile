import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import {
	PlusJakartaSans_300Light,
	PlusJakartaSans_400Regular,
	PlusJakartaSans_500Medium,
	PlusJakartaSans_600SemiBold,
	PlusJakartaSans_700Bold,
	PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/global.css';
import { setAuthTokenGetter } from '@/lib/api';

function AuthTokenBridge() {
	const { getToken } = useAuth();
	useEffect(() => {
		setAuthTokenGetter(() => getToken());
	}, [getToken]);
	return null;
}

export const unstable_settings = {
	initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
	throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		'sans-light': PlusJakartaSans_300Light,
		'sans-regular': PlusJakartaSans_400Regular,
		'sans-medium': PlusJakartaSans_500Medium,
		'sans-semibold': PlusJakartaSans_600SemiBold,
		'sans-bold': PlusJakartaSans_700Bold,
		'sans-extrabold': PlusJakartaSans_800ExtraBold,
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) return null;

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
				<AuthTokenBridge />
				<Slot />
			</ClerkProvider>
		</GestureHandlerRootView>
	);
}
