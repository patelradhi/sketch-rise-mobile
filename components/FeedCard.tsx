import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { FloorPlanJob } from '@/lib/floorPlan.api';

interface Props {
	job: FloorPlanJob;
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export function FeedCard({ job }: Props) {
	const router = useRouter();

	return (
		<Pressable className="feed-card" onPress={() => router.push(`/result/${job.id}`)}>
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
	);
}
