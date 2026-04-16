import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

export default function Landing() {
	const { isSignedIn, isLoaded } = useAuth();

	if (!isLoaded) {
		return (
			<View className="auth-screen items-center">
				<Text className="text-accent text-lg font-sans-medium">Loading...</Text>
			</View>
		);
	}

	if (isSignedIn) return <Redirect href="/home" />;

	return (
		<SafeAreaView className="auth-safe-area p-5">
			{/* Logo */}
			<View className="flex-row items-center mb-6 gap-3">
				<View className="auth-logo-mark">
					<Text className="auth-logo-mark-text">S</Text>
				</View>
				<Text className="auth-wordmark">SketchRise</Text>
			</View>
			{/* Badge */}
			<View className="badge-pill mb-8">
				<Text className="badge-pill-text">Powered by Claude AI</Text>
			</View>

			{/* Hero */}
			<Text className="heading-hero mb-4">
				Turn your sketch{'\n'}into a <Text className="text-accent">3D space</Text>
				{'\n'}instantly.
			</Text>

			{/* Subtitle */}
			<Text className="auth-subtitle self-center mb-10">
				Upload any hand-drawn or digital floor plan. Claude AI parses the layout and React Three Fiber builds a
				photorealistic 3D visualization in seconds.
			</Text>

			{/* Buttons */}
			<View className="flex-row gap-3 mb-12">
				<Pressable className="flex-1 btn-primary">
					<Text className="btn-primary-text">Start Building</Text>
				</Pressable>

				<Pressable className="flex-1 btn-outline">
					<Text className="btn-outline-text">Watch Demo</Text>
				</Pressable>
			</View>

			{/* Stats */}
			<View className="flex-row card-surface">
				<View className="items-center flex-1">
					<Text className="stat-value">2s</Text>
					<Text className="stat-label">avg processing</Text>
				</View>
				<View className="divider-vertical" />
				<View className="items-center flex-[1.4]">
					<Text className="stat-value">PNG/JPG</Text>
					<Text className="stat-label">any sketch</Text>
				</View>
				<View className="divider-vertical" />
				<View className="items-center flex-1">
					<Text className="stat-value">3D</Text>
					<Text className="stat-label">instant render</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}
