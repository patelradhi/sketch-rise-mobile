import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { ShareSheet } from '@/components/ShareSheet';
import { ZoomableImage } from '@/components/ZoomableImage';
import { getFloorPlanJob, type FloorPlanJob } from '@/lib/floorPlan.api';

const SafeAreaView = styled(RNSafeAreaView);

export default function ResultPage() {
	const { jobId } = useLocalSearchParams<{ jobId: string }>();
	const router = useRouter();
	const [job, setJob] = useState<FloorPlanJob | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);

	useEffect(() => {
		if (!jobId) return;
		getFloorPlanJob(jobId)
			.then(setJob)
			.catch((err) =>
				setLoadError(err instanceof Error ? err.message : 'Could not load project'),
			);
	}, [jobId]);

	const handleExit = () => router.replace('/');

	const handleExport = async () => {
		if (!job?.generated3dUrl) return;
		setExporting(true);
		try {
			const target = `${FileSystem.cacheDirectory}floorplan-${job.id}.png`;
			const { uri } = await FileSystem.downloadAsync(job.generated3dUrl, target);

			// writeOnly=true → only ask for write access, avoids the Android AUDIO manifest crash
			const permission = await MediaLibrary.requestPermissionsAsync(true);
			if (permission.status !== 'granted') {
				Alert.alert('Permission needed', 'Allow photo access to save the image.');
				return;
			}
			await MediaLibrary.saveToLibraryAsync(uri);
			Alert.alert('Saved', 'The 3D floor plan was saved to your Photos.');
		} catch (err) {
			Alert.alert('Export failed', err instanceof Error ? err.message : 'Please try again.');
		} finally {
			setExporting(false);
		}
	};

	if (loadError) {
		return (
			<View className="flex-1 bg-background">
				<StatusBar style="light" />
				<SafeAreaView className="flex-1 items-center justify-center px-6">
					<Ionicons name="alert-circle-outline" size={40} color="#f59e0b" />
					<Text className="error-text mt-4 text-center">{loadError}</Text>
					<Pressable className="btn-outline mt-5 px-8" onPress={handleExit}>
						<Text className="btn-outline-text">Back to home</Text>
					</Pressable>
				</SafeAreaView>
			</View>
		);
	}

	if (!job) {
		return (
			<View className="flex-1 bg-background">
				<StatusBar style="light" />
				<SafeAreaView className="flex-1 items-center justify-center">
					<ActivityIndicator color="#f59e0b" />
				</SafeAreaView>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<StatusBar style="light" />
			<SafeAreaView className="flex-1" edges={['top', 'bottom']}>
				{/* Top bar — title on the left, exit pill on the right */}
				<View className="flex-row items-center justify-between px-5 pt-3 pb-2">
					<View className="flex-1 pr-3">
						<Text className="kicker-accent mb-1">PROJECT</Text>
						<Text
							className="text-xl font-display text-primary leading-tight"
							numberOfLines={1}
						>
							{job.title}
						</Text>
					</View>

					<Pressable
						onPress={handleExit}
						className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-muted border border-accent/20"
					>
						<Ionicons name="close" size={16} color="#f5f0e8" />
						<Text className="text-[11px] font-label uppercase tracking-[2px] text-primary">
							Exit
						</Text>
					</Pressable>
				</View>

				{/* Full-bleed zoomable image — fills all remaining space */}
				<View className="flex-1 mx-5 mt-2 rounded-3xl overflow-hidden border border-accent/20 bg-muted">
					{job.generated3dUrl ? (
						<ZoomableImage uri={job.generated3dUrl} />
					) : (
						<View className="flex-1 items-center justify-center">
							<Text className="meta-muted">No render yet</Text>
						</View>
					)}
				</View>

				{/* Hint */}
				<Text className="text-center text-xs font-label text-muted-foreground mt-2 mb-1">
					Pinch to zoom · Double-tap to reset
				</Text>

				{/* Sticky footer — pill buttons */}
				<View className="flex-row gap-3 px-5 pt-3 pb-3">
					<Pressable
						onPress={handleExport}
						disabled={exporting}
						className="flex-1 flex-row items-center justify-center gap-2 bg-accent rounded-full py-4"
						style={exporting ? { opacity: 0.7 } : undefined}
					>
						{exporting ? (
							<ActivityIndicator size="small" color="#0a0900" />
						) : (
							<Ionicons name="download-outline" size={18} color="#0a0900" />
						)}
						<Text className="text-base font-heading text-background">
							{exporting ? 'Saving' : 'Export'}
						</Text>
					</Pressable>

					<Pressable
						onPress={() => setShareOpen(true)}
						disabled={exporting}
						className="flex-1 flex-row items-center justify-center gap-2 bg-muted border border-accent/30 rounded-full py-4"
					>
						<Ionicons name="share-social-outline" size={18} color="#f5f0e8" />
						<Text className="text-base font-heading text-primary">Share</Text>
					</Pressable>
				</View>
			</SafeAreaView>

			<ShareSheet
				visible={shareOpen}
				imageUrl={job.generated3dUrl ?? ''}
				onClose={() => setShareOpen(false)}
			/>
		</View>
	);
}
