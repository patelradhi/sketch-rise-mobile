import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
	{ icon: 'cube-outline', title: 'Photorealistic 3D', desc: 'Top-down architectural renders generated from any 2D plan.' },
	{ icon: 'expand-outline', title: 'Pinch & Zoom', desc: 'Inspect every corner of your floor plan with smooth gestures.' },
	{ icon: 'sparkles-outline', title: 'AI Powered', desc: 'Gemini parses rooms, walls, doors, and lighting automatically.' },
	{ icon: 'image-outline', title: 'JPG / PNG Input', desc: 'Hand-drawn sketches or digital plans, both work.' },
	{ icon: 'cloud-download-outline', title: 'One-Tap Export', desc: 'Save renders straight to your device Photos.' },
	{ icon: 'share-social-outline', title: 'Share Anywhere', desc: 'WhatsApp, Email, friendly preview-ready URLs.' },
];

const STEPS = [
	{ num: '1', title: 'Upload', desc: 'Drop a photo or PNG of your 2D floor plan.' },
	{ num: '2', title: 'Generate', desc: 'AI converts it into a top-down 3D render in under a minute.' },
	{ num: '3', title: 'Export', desc: 'Save, share, or build on it in 3D space.' },
];

export default function Product() {
	const router = useRouter();

	return (
		<SafeAreaView className="auth-safe-area">
			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero */}
				<Text className="kicker-accent mb-3">PRODUCT</Text>
				<Text className="text-4xl font-display text-primary leading-tight mb-3">
					Built for makers,{'\n'}<Text className="text-accent">refined</Text> for pros.
				</Text>
				<Text className="text-body mb-8">
					Everything you need to turn a sketch into a beautiful 3D space — faster than your coffee gets cold.
				</Text>

				{/* Feature grid */}
				<Text className="text-xs font-label uppercase tracking-[2px] text-muted-foreground mb-4">
					Features
				</Text>
				<View className="flex-row flex-wrap" style={{ gap: 12 }}>
					{FEATURES.map((f) => (
						<View
							key={f.title}
							className="bg-card rounded-2xl p-4 border border-border"
							style={{ width: '48.5%' }}
						>
							<View className="size-10 rounded-xl bg-accent-soft items-center justify-center mb-3">
								<Ionicons name={f.icon} size={20} color="#f59e0b" />
							</View>
							<Text className="text-sm font-heading text-primary mb-1">{f.title}</Text>
							<Text className="text-xs font-sans text-muted-foreground leading-4">{f.desc}</Text>
						</View>
					))}
				</View>

				{/* How it works */}
				<Text className="text-xs font-label uppercase tracking-[2px] text-muted-foreground mt-10 mb-4">
					How it works
				</Text>
				<View className="bg-card rounded-2xl p-5 border border-border">
					{STEPS.map((s, i) => (
						<View key={s.num} className={`flex-row items-start gap-4 ${i > 0 ? 'mt-5' : ''}`}>
							<View className="size-9 rounded-full bg-accent items-center justify-center">
								<Text className="text-sm font-display text-background">{s.num}</Text>
							</View>
							<View className="flex-1">
								<Text className="text-base font-heading text-primary mb-1">{s.title}</Text>
								<Text className="text-sm font-sans text-muted-foreground leading-5">{s.desc}</Text>
							</View>
						</View>
					))}
				</View>

				{/* CTA */}
				<Pressable
					className="btn-primary mt-10 flex-row justify-center items-center gap-2"
					onPress={() => router.push('/' as never)}
				>
					<Text className="btn-primary-text">Start Building</Text>
					<Ionicons name="arrow-forward" size={18} color="#0a0900" />
				</Pressable>
			</ScrollView>
		</SafeAreaView>
	);
}
