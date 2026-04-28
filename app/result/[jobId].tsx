import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { ShareSheet } from '@/components/ShareSheet';
import { RenameModal } from '@/components/RenameModal';
import { ZoomableImage } from '@/components/ZoomableImage';
import { deleteFloorPlanJob, getFloorPlanJob, renameFloorPlanJob, type FloorPlanJob } from '@/lib/floorPlan.api';

const SafeAreaView = styled(RNSafeAreaView);

interface Structure {
	rooms?: Array<{ type?: string }>;
	total_area_sqm?: number;
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function deriveStats(structure: unknown) {
	const s = (structure ?? null) as Structure | null;
	const rooms = s?.rooms ?? [];
	const beds = rooms.filter((r) => r.type === 'bedroom').length;
	const baths = rooms.filter((r) => r.type === 'bathroom').length;
	const sqft = s?.total_area_sqm ? Math.round(s.total_area_sqm * 10.764) : null;
	return { beds, baths, sqft, roomCount: rooms.length };
}

export default function ResultPage() {
	const { jobId } = useLocalSearchParams<{ jobId: string }>();
	const router = useRouter();
	const [job, setJob] = useState<FloorPlanJob | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [renameOpen, setRenameOpen] = useState(false);
	const [imageAspect, setImageAspect] = useState<number | null>(null);

	useEffect(() => {
		if (!jobId) return;
		getFloorPlanJob(jobId)
			.then(setJob)
			.catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load project'));
	}, [jobId]);

	const handleBack = () => router.replace('/');

	const handleExport = async () => {
		if (!job?.generated3dUrl) return;
		setExporting(true);
		try {
			const target = `${FileSystem.cacheDirectory}floorplan-${job.id}.png`;
			const { uri } = await FileSystem.downloadAsync(job.generated3dUrl, target);
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

	const handleRename = async (title: string) => {
		if (!job) return;
		try {
			const updated = await renameFloorPlanJob(job.id, title);
			setJob(updated);
			setRenameOpen(false);
		} catch (err) {
			Alert.alert('Rename failed', err instanceof Error ? err.message : 'Please try again.');
		}
	};

	const handleDelete = () => {
		if (!job) return;
		setMenuOpen(false);
		Alert.alert('Delete project?', `"${job.title}" will be removed. This can't be undone.`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteFloorPlanJob(job.id);
						router.replace('/');
					} catch (err) {
						Alert.alert('Delete failed', err instanceof Error ? err.message : 'Please try again.');
					}
				},
			},
		]);
	};

	if (loadError) {
		return (
			<View className="flex-1 bg-background">
				<StatusBar style="light" />
				<SafeAreaView className="flex-1 items-center justify-center px-6">
					<Ionicons name="alert-circle-outline" size={40} color="#f59e0b" />
					<Text className="error-text mt-4 text-center">{loadError}</Text>
					<Pressable className="btn-outline mt-5 px-8" onPress={handleBack}>
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

	const stats = deriveStats(job.structure);
	const metaParts: string[] = [];
	if (stats.beds > 0) metaParts.push(`${stats.beds} bed${stats.beds === 1 ? '' : 's'}`);
	if (stats.baths > 0) metaParts.push(`${stats.baths} bath${stats.baths === 1 ? '' : 's'}`);
	metaParts.push(formatDate(job.createdAt));

	return (
		<View className="flex-1 bg-background">
			<StatusBar style="light" />
			<SafeAreaView className="flex-1" edges={['top', 'bottom']}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
					{/* Top bar — back + 3-dot menu */}
					<View className="flex-row items-center justify-between px-5 pt-3 pb-2">
						<Pressable
							onPress={handleBack}
							className="size-10 rounded-xl bg-muted items-center justify-center"
						>
							<Ionicons name="chevron-back" size={20} color="#f5f0e8" />
						</Pressable>

						<Pressable
							onPress={() => setMenuOpen((v) => !v)}
							className="size-10 rounded-xl bg-muted items-center justify-center"
							hitSlop={8}
						>
							<Ionicons name="ellipsis-vertical" size={18} color="#f5f0e8" />
						</Pressable>
					</View>

					{/* Dropdown menu (rename / delete) */}
					{menuOpen && (
						<View className="absolute top-14 right-5 bg-card border border-border rounded-xl py-1 z-50 min-w-[160px]">
							<Pressable
								className="flex-row items-center gap-3 px-4 py-3"
								onPress={() => {
									setMenuOpen(false);
									setRenameOpen(true);
								}}
							>
								<Ionicons name="pencil-outline" size={16} color="#f5f0e8" />
								<Text className="text-sm font-label text-primary">Rename</Text>
							</Pressable>
							<Pressable className="flex-row items-center gap-3 px-4 py-3" onPress={handleDelete}>
								<Ionicons name="trash-outline" size={16} color="#dc2626" />
								<Text className="text-sm font-label text-destructive">Delete</Text>
							</Pressable>
						</View>
					)}

					{/* Title + meta */}
					<View className="px-6 pt-3 pb-5">
						<Text className="kicker-accent mb-2">PROJECT</Text>
						<Text className="text-3xl font-display text-primary leading-tight mb-2">{job.title}</Text>
						<Text className="text-sm font-label text-muted-foreground">{metaParts.join('  ·  ')}</Text>
					</View>

					{/* Cream image card with padding around the floor plan — pinch to zoom */}
					<View className="mx-5 rounded-3xl p-4" style={{ backgroundColor: '#f5f0e8' }}>
						<View
							className="rounded-2xl overflow-hidden"
							style={{ width: '100%', aspectRatio: (imageAspect ?? 4 / 3) * 0.7 }}
						>
							{job.generated3dUrl ? (
								<ZoomableImage uri={job.generated3dUrl} onLoad={(w, h) => setImageAspect(w / h)} />
							) : (
								<View className="flex-1 items-center justify-center">
									<Text className="text-xs font-label text-muted-foreground">No render yet</Text>
								</View>
							)}
						</View>
					</View>

					{/* Stats chips — shown only when we have structure data */}
					{(stats.sqft || stats.roomCount > 0 || job.generated3dUrl) && (
						<View className="flex-row gap-3 px-5 mt-5">
							<View className="flex-1 bg-card rounded-2xl py-4 items-center">
								<Text className="text-xl font-heading text-accent">{stats.sqft ?? '—'}</Text>
								<Text className="text-[11px] font-label text-muted-foreground mt-2">sq ft</Text>
							</View>
							<View className="flex-1 bg-card rounded-2xl py-4 items-center">
								<Text className="text-xl font-heading text-accent">
									{stats.roomCount > 0 ? stats.roomCount : '—'}
								</Text>
								<Text className="text-[11px] font-label text-muted-foreground mt-0.5">rooms</Text>
							</View>
							<View className="flex-1 bg-card rounded-2xl py-4 items-center">
								<Text className="text-xl font-heading text-accent">3D</Text>
								<Text className="text-[11px] font-label text-muted-foreground mt-0.5">ready</Text>
							</View>
						</View>
					)}

					{/* Primary CTA */}
					<Pressable
						className="mx-5 mt-5 flex-row items-center justify-center gap-2 bg-accent rounded-2xl py-4"
						onPress={() => Alert.alert('Coming soon', 'Interactive 3D viewer is on the way.')}
					>
						<Ionicons name="cube-outline" size={20} color="#0a0900" />
						<Text className="text-base font-heading text-background">Build in 3D</Text>
					</Pressable>
				</ScrollView>

				{/* Sticky bottom footer — Export + Share */}
				<View className="flex-row gap-3 px-5 pt-3 pb-2 border-t border-border bg-background">
					<Pressable
						onPress={handleExport}
						disabled={exporting}
						className="flex-1 flex-row items-center justify-center gap-2 bg-muted rounded-2xl py-4 border border-accent/20"
						style={exporting ? { opacity: 0.7 } : undefined}
					>
						{exporting ? (
							<ActivityIndicator size="small" color="#f5f0e8" />
						) : (
							<Ionicons name="download-outline" size={18} color="#f5f0e8" />
						)}
						<Text className="text-base font-heading text-primary">{exporting ? 'Saving' : 'Export'}</Text>
					</Pressable>

					<Pressable
						onPress={() => setShareOpen(true)}
						disabled={exporting}
						className="flex-1 flex-row items-center justify-center gap-2 bg-muted rounded-2xl py-4 border border-accent/20"
					>
						<Ionicons name="share-social-outline" size={18} color="#f5f0e8" />
						<Text className="text-base font-heading text-primary">Share</Text>
					</Pressable>
				</View>
			</SafeAreaView>

			<ShareSheet visible={shareOpen} imageUrl={job.generated3dUrl ?? ''} onClose={() => setShareOpen(false)} />
			<RenameModal
				visible={renameOpen}
				initialTitle={job.title}
				onCancel={() => setRenameOpen(false)}
				onSave={handleRename}
			/>
		</View>
	);
}
