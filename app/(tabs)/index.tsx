/**
 * Home / Landing Tab
 *
 * This is the first tab users see. It shows the hero section,
 * "Start Building" button, and stats. Always public.
 *
 * AUTH-AWARE BEHAVIOR:
 * - "Start Building" → if signed in, navigates to build screen.
 *   If not, redirects to /sign-in first.
 * - Header shows "Sign In" button or user avatar based on auth state.
 * - All other tabs (Product, Pricing, Community) are freely accessible.
 */

import { useAuth, useClerk, useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useFloorPlanJob } from '@/hooks/useFloorPlanJob';
import { useMyFloorPlans } from '@/hooks/useMyFloorPlans';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { FeedCard } from '@/components/FeedCard';

const SafeAreaView = styled(RNSafeAreaView);

export default function Home() {
	const { isSignedIn, isLoaded } = useAuth();
	const { user } = useUser();
	const { signOut } = useClerk();
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const { start, reset, status, error } = useFloorPlanJob();
	const { items: feedItems, refresh: refreshFeed } = useMyFloorPlans();
	const isGenerating = status === 'uploading' || status === 'generating';

	useEffect(() => {
		if (status === 'completed') void refreshFeed();
	}, [status, refreshFeed]);

	const pickImage = async () => {
		if (!isSignedIn) {
			router.push('/sign-in');
			return;
		}
		if (isGenerating) return;

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
				Alert.alert('File too large', 'Please select an image under 50 MB.');
				return;
			}
			setSelectedImage(asset.uri);
			await start(asset.uri);
		}
	};

	const retry = () => {
		if (selectedImage) void start(selectedImage);
	};

	if (!isLoaded) {
		return (
			<View className="auth-screen items-center">
				<Text className="text-accent text-lg font-label">Loading...</Text>
			</View>
		);
	}

	const userInitial = user?.firstName?.charAt(0)?.toUpperCase()
		?? user?.primaryEmailAddress?.emailAddress?.charAt(0)?.toUpperCase()
		?? 'U';

	return (
		<SafeAreaView className="auth-safe-area p-5">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
			{/* ── Header ── */}
			<View className="flex-row items-center justify-between mb-6">
				<View className="flex-row items-center gap-3">
					<View className="auth-logo-mark">
						<Text className="auth-logo-mark-text">S</Text>
					</View>
					<Text className="auth-wordmark">SketchRise</Text>
				</View>

				{isSignedIn ? (
					<View className="relative">
						<Pressable
							onPress={() => setMenuOpen(!menuOpen)}
							className="user-avatar"
						>
							<Text className="user-avatar-text">{userInitial}</Text>
						</Pressable>

						{menuOpen && (
							<View className="user-menu min-w-[200px]">
								{/* User info */}
								<View className="px-4 py-3 border-b border-border">
									<Text className="text-sm font-heading text-primary" numberOfLines={1}>
										{user?.firstName ?? 'User'}
									</Text>
									<Text className="text-xs font-sans text-muted-foreground mt-1" numberOfLines={1}>
										{user?.primaryEmailAddress?.emailAddress ?? ''}
									</Text>
								</View>

								{/* Menu items */}
								<Pressable className="user-menu-item">
									<Text className="user-menu-text">Profile</Text>
								</Pressable>

								<Pressable
									className="user-menu-item"
									onPress={() => {
										setMenuOpen(false);
										signOut();
									}}
								>
									<Text className="user-menu-text text-destructive">Sign Out</Text>
								</Pressable>
							</View>
						)}
					</View>
				) : (
					<Pressable
						onPress={() => router.push('/sign-in')}
						className="btn-signin"
					>
						<Text className="btn-signin-text">Sign In</Text>
					</Pressable>
				)}
			</View>

			{/* ── Badge ── */}
			<View className="badge-pill mb-8">
				<Text className="badge-pill-text">Powered by Claude AI</Text>
			</View>

			{/* ── Hero ── */}
			<Text className="heading-hero mb-4">
				Turn your sketch{'\n'}into a <Text className="text-accent">3D space</Text>
				{'\n'}instantly.
			</Text>

			{/* ── Subtitle ── */}
			<Text className="auth-subtitle self-center mb-10">
				Upload any hand-drawn or digital floor plan. Claude AI parses the
				layout and React Three Fiber builds a photorealistic 3D
				visualization in seconds.
			</Text>

			{/* ── Buttons ── */}
			<View className="flex-row gap-3 mb-12">
				<Pressable
					className="flex-1 btn-primary"
					onPress={() => {
						if (isSignedIn) {
							// TODO: navigate to build screen when ready
						} else {
							router.push('/sign-in');
						}
					}}
				>
					<Text className="btn-primary-text">Start Building</Text>
				</Pressable>

				<Pressable className="flex-1 btn-outline">
					<Text className="btn-outline-text">Watch Demo</Text>
				</Pressable>
			</View>

			{/* ── Stats ── */}
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

			{/* ── Upload Card ── */}
			<View className="upload-card">
				<View className="upload-icon-circle">
					<Ionicons name="layers-outline" size={28} color="#f59e0b" />
				</View>
				<Text className="upload-title">Upload your floor plan</Text>
				<Text className="upload-hint">Supports JPG, PNG — max 50 MB</Text>

				{isGenerating && selectedImage ? (
					<GeneratingOverlay sourceUri={selectedImage} />
				) : status === 'failed' ? (
					<View className="upload-dashed">
						<Ionicons name="alert-circle-outline" size={24} color="#f59e0b" />
						<Text className="error-text mt-2 text-center">
							{error ?? 'Generation failed'}
						</Text>
						<View className="flex-row gap-3 w-full mt-3">
							<Pressable className="flex-1 btn-outline" onPress={reset}>
								<Text className="btn-outline-text">Cancel</Text>
							</Pressable>
							<Pressable className="flex-1 btn-primary" onPress={retry}>
								<Text className="btn-primary-text">Retry</Text>
							</Pressable>
						</View>
					</View>
				) : (
					<Pressable onPress={pickImage} className="upload-dashed">
						<View className="size-12 rounded-full bg-muted items-center justify-center mb-3">
							<Ionicons name="cloud-upload-outline" size={24} color="rgba(245, 240, 232, 0.5)" />
						</View>
						<Text className="text-sm font-emphasis text-primary mb-1">
							Tap to upload a 2D floor plan
						</Text>
						<Text className="text-xs font-sans text-muted-foreground">
							Select from your gallery
						</Text>
					</Pressable>
				)}
			</View>

			{/* ── Projects Feed ── */}
			{isSignedIn && (
				<View className="mt-8">
					<Text className="tab-title mb-1">Projects</Text>
					<Text className="text-body mb-4">
						Your latest work, all in one place.
					</Text>

					{feedItems.length === 0 ? (
						<Text className="home-empty-state text-center">
							No projects yet. Upload a 2D floor plan to get started.
						</Text>
					) : (
						feedItems.map((job) => <FeedCard key={job.id} job={job} />)
					)}
				</View>
			)}
			</ScrollView>
		</SafeAreaView>
	);
}
