/**
 * Home / Landing Tab
 *
 * Hero, primary CTAs, stats, upload card, and Projects feed.
 *
 * Behavior:
 * - "Start Building" → scrolls to the upload card (or /sign-in if signed out).
 * - "Watch Demo" → opens the DemoModal carousel.
 * - Cross-tab CTAs (Product / Pricing) push to /?scroll=upload, which lands
 *   here, jumps to the top, then smoothly scrolls to the upload card.
 * - Header shows a Sign In pill when signed out, avatar menu when signed in.
 */

import { useAuth, useClerk, useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useFloorPlanJob } from '@/hooks/useFloorPlanJob';
import { useMyFloorPlans } from '@/hooks/useMyFloorPlans';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { FeedCard } from '@/components/FeedCard';
import { DemoModal } from '@/components/DemoModal';

const SafeAreaView = styled(RNSafeAreaView);

export default function Home() {
	const { isSignedIn, isLoaded } = useAuth();
	const { user } = useUser();
	const { signOut } = useClerk();
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const { start, reset, status, error } = useFloorPlanJob();
	const { items: feedItems, loading: feedLoading, refresh: refreshFeed } = useMyFloorPlans();
	const isGenerating = status === 'uploading' || status === 'generating';

	const scrollRef = useRef<ScrollView>(null);
	const uploadYRef = useRef(0);
	const [highlightUpload, setHighlightUpload] = useState(false);
	const [demoOpen, setDemoOpen] = useState(false);

	const scrollToUpload = () => {
		scrollRef.current?.scrollTo({ y: Math.max(uploadYRef.current - 16, 0), animated: true });
		setHighlightUpload(true);
		setTimeout(() => setHighlightUpload(false), 500);
	};

	// Used when arriving on the home tab from another tab (e.g. Product CTA):
	// jump to the very top first so the user *sees* the page load, then smoothly
	// scroll down to the upload zone and highlight it.
	const scrollFromTopToUpload = () => {
		scrollRef.current?.scrollTo({ y: 0, animated: false });
		setTimeout(scrollToUpload, 500);
	};

	useEffect(() => {
		if (status === 'completed') void refreshFeed();
	}, [status, refreshFeed]);

	// When the home tab is opened with ?scroll=upload (e.g. from Product CTA),
	// scroll to the upload zone and clear the param so it doesn't re-trigger.
	const { scroll } = useLocalSearchParams<{ scroll?: string }>();
	useFocusEffect(
		useCallback(() => {
			if (scroll !== 'upload') return;
			const t = setTimeout(() => {
				scrollFromTopToUpload();
				router.setParams({ scroll: undefined } as never);
			}, 100);
			return () => clearTimeout(t);
		}, [scroll, router]),
	);

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

	const userInitial =
		user?.firstName?.charAt(0)?.toUpperCase() ??
		user?.primaryEmailAddress?.emailAddress?.charAt(0)?.toUpperCase() ??
		'U';

	return (
		<SafeAreaView className="auth-safe-area p-5">
			<ScrollView
				ref={scrollRef}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 100 }}
			>
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
							<Pressable onPress={() => setMenuOpen(!menuOpen)} className="user-avatar">
								<Text className="user-avatar-text">{userInitial}</Text>
							</Pressable>

							{menuOpen && (
								<View className="user-menu min-w-[200px]">
									{/* User info */}
									<View className="px-4 py-3 border-b border-border">
										<Text className="text-sm font-heading text-primary" numberOfLines={1}>
											{user?.firstName ?? 'User'}
										</Text>
										<Text
											className="text-xs font-sans text-muted-foreground mt-1"
											numberOfLines={1}
										>
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
						<Pressable onPress={() => router.push('/sign-in')} className="btn-signin">
							<Text className="btn-signin-text">Sign In</Text>
						</Pressable>
					)}
				</View>

				{/* ── Hero ── */}
				<Text className="heading-hero mb-4 mt-4">
					Turn your sketch{'\n'}into a <Text className="text-accent">3D space</Text>
					{'\n'}instantly.
				</Text>

				{/* ── Subtitle ── */}
				<Text className="auth-subtitle self-center mb-10">
					Upload any hand-drawn or digital floor plan. Our AI parses the layout and renders a
					photorealistic 3D visualization in seconds.
				</Text>

				{/* ── Buttons ── */}
				<View className="flex-row gap-3 mb-12">
					<Pressable
						className="flex-1 btn-primary"
						onPress={() => {
							if (isSignedIn) {
								scrollToUpload();
							} else {
								router.push('/sign-in');
							}
						}}
					>
						<Text className="btn-primary-text">Start Building</Text>
					</Pressable>

					<Pressable className="flex-1 btn-outline" onPress={() => setDemoOpen(true)}>
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
				<View
					className="upload-card"
					onLayout={(e) => {
						uploadYRef.current = e.nativeEvent.layout.y;
					}}
					style={highlightUpload ? { borderWidth: 2, borderColor: '#f59e0b' } : undefined}
				>
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
							<Text className="error-text mt-2 text-center">{error ?? 'Generation failed'}</Text>
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
							<Text className="text-xs font-sans text-muted-foreground">Select from your gallery</Text>
						</Pressable>
					)}
				</View>

				{/* ── Projects Feed ── */}
				{isSignedIn && (
					<View className="mt-8">
						<Text className="tab-title mb-1">Projects</Text>
						<Text className="text-body mb-4">Your latest work, all in one place.</Text>

						{feedLoading && feedItems.length === 0 ? (
							<View className="py-10 items-center">
								<ActivityIndicator color="#f59e0b" />
								<Text className="text-xs font-label text-muted-foreground mt-3">
									Loading your projects…
								</Text>
							</View>
						) : feedItems.length === 0 ? (
							<Text className="home-empty-state text-center">
								No projects yet. Upload a 2D floor plan to get started.
							</Text>
						) : (
							feedItems.map((job) => <FeedCard key={job.id} job={job} />)
						)}
					</View>
				)}
			</ScrollView>

			<DemoModal
				visible={demoOpen}
				onClose={() => setDemoOpen(false)}
				onTryIt={() => {
					setDemoOpen(false);
					setTimeout(() => scrollFromTopToUpload(), 350);
				}}
			/>
		</SafeAreaView>
	);
}
