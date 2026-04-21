import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShareSheet } from '@/components/ShareSheet';
import { getFloorPlanJob, type FloorPlanJob } from '@/lib/floorPlan.api';

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

			const permission = await MediaLibrary.requestPermissionsAsync();
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
			<SafeAreaView className="auth-safe-area items-center justify-center px-6">
				<Text className="error-text text-center">{loadError}</Text>
				<Pressable className="btn-outline mt-4 px-6" onPress={handleExit}>
					<Text className="btn-outline-text">Back to home</Text>
				</Pressable>
			</SafeAreaView>
		);
	}

	if (!job) {
		return (
			<SafeAreaView className="auth-safe-area items-center justify-center">
				<ActivityIndicator color="#f59e0b" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="auth-safe-area">
			<View className="editor-topbar">
				<View className="flex-row items-center gap-3">
					<View className="auth-logo-mark">
						<Text className="auth-logo-mark-text">S</Text>
					</View>
					<Text className="auth-wordmark">SketchRise</Text>
				</View>

				<Pressable className="editor-exit" onPress={handleExit}>
					<Ionicons name="close" size={16} color="#f5f0e8" />
					<Text className="editor-exit-text">EXIT EDITOR</Text>
				</Pressable>
			</View>

			<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
				<View className="editor-card">
					<View className="editor-card-header">
						<Text className="kicker-accent mb-2">PROJECT</Text>
						<Text className="auth-title mb-1">{job.title}</Text>
						<Text className="meta-muted mb-4">CREATED BY YOU</Text>

						<View className="flex-row gap-3">
							<Pressable
								className="btn-primary-row flex-1"
								onPress={handleExport}
								disabled={exporting}
							>
								{exporting ? (
									<ActivityIndicator color="#0a0900" />
								) : (
									<Ionicons name="download-outline" size={18} color="#0a0900" />
								)}
								<Text className="btn-primary-text">
									{exporting ? 'Saving…' : 'EXPORT'}
								</Text>
							</Pressable>

							<Pressable
								className="btn-secondary flex-1"
								onPress={() => setShareOpen(true)}
								disabled={exporting}
							>
								<Ionicons name="share-social-outline" size={18} color="#f5f0e8" />
								<Text className="btn-secondary-text">SHARE</Text>
							</Pressable>
						</View>
					</View>

					<View className="editor-card-divider" />

					<View className="editor-image-wrap">
						{job.generated3dUrl ? (
							<Image
								source={{ uri: job.generated3dUrl }}
								style={{ width: '100%', height: '100%' }}
								contentFit="contain"
							/>
						) : null}
					</View>
				</View>
			</ScrollView>

			<ShareSheet
				visible={shareOpen}
				imageUrl={job.generated3dUrl ?? ''}
				onClose={() => setShareOpen(false)}
			/>
		</SafeAreaView>
	);
}
