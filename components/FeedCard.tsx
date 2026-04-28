import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { FloorPlanJob } from '@/lib/floorPlan.api';
import { deleteFloorPlanJob, renameFloorPlanJob } from '@/lib/floorPlan.api';
import { RenameModal } from '@/components/RenameModal';

interface Props {
	job: FloorPlanJob;
	onChanged?: () => void;
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export function FeedCard({ job, onChanged }: Props) {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [renameOpen, setRenameOpen] = useState(false);

	const handleOpen = () => {
		if (menuOpen) return setMenuOpen(false);
		router.push(`/result/${job.id}` as never);
	};

	const handleRename = async (title: string) => {
		try {
			await renameFloorPlanJob(job.id, title);
			setRenameOpen(false);
			onChanged?.();
		} catch (err) {
			Alert.alert('Rename failed', err instanceof Error ? err.message : 'Please try again.');
		}
	};

	const handleDelete = () => {
		setMenuOpen(false);
		Alert.alert('Delete project?', `"${job.title}" will be removed. This can't be undone.`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteFloorPlanJob(job.id);
						onChanged?.();
					} catch (err) {
						Alert.alert('Delete failed', err instanceof Error ? err.message : 'Please try again.');
					}
				},
			},
		]);
	};

	return (
		<View className="feed-card">
			<Pressable onPress={handleOpen}>
				<View className="feed-thumb">
					{job.generated3dUrl ? (
						<Image
							source={{ uri: job.generated3dUrl }}
							style={{ width: '100%', height: '100%' }}
							contentFit="cover"
						/>
					) : null}
					<View className="absolute top-3 left-3 badge-pill">
						<Text className="badge-pill-text">MY PROJECT</Text>
					</View>

					{/* 3-dot menu trigger */}
					<Pressable
						onPress={() => setMenuOpen((v) => !v)}
						className="absolute top-2 right-2 size-9 rounded-full bg-background/70 items-center justify-center"
						hitSlop={8}
					>
						<Ionicons name="ellipsis-horizontal" size={18} color="#f5f0e8" />
					</Pressable>
				</View>

				<View className="feed-body">
					<Text className="feed-title" numberOfLines={1}>
						{job.title}
					</Text>
					<View className="flex-row items-center gap-2">
						<Ionicons name="calendar-outline" size={12} color="rgba(245, 240, 232, 0.5)" />
						<Text className="meta-muted">
							{formatDate(job.createdAt)}  ·  BY {job.userName.toUpperCase()}
						</Text>
					</View>
				</View>
			</Pressable>

			{/* Dropdown menu */}
			{menuOpen && (
				<View className="absolute top-12 right-3 bg-card border border-border rounded-xl py-1 z-50 min-w-[160px]">
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

			<RenameModal
				visible={renameOpen}
				initialTitle={job.title}
				onCancel={() => setRenameOpen(false)}
				onSave={handleRename}
			/>
		</View>
	);
}
