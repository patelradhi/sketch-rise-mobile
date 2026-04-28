import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

const STATS = [
	{ value: '12K+', label: 'projects rendered' },
	{ value: '4.9★', label: 'app rating' },
	{ value: '50+', label: 'countries' },
];

const FEATURED = [
	{
		title: 'Studio loft in Manhattan',
		author: 'JS Mastery',
		date: 'Apr 12, 2026',
		emoji: '🏙️',
	},
	{
		title: 'Coastal cottage retreat',
		author: 'Maya P.',
		date: 'Apr 10, 2026',
		emoji: '🏖️',
	},
	{
		title: 'Modern duplex',
		author: 'Daniel R.',
		date: 'Apr 8, 2026',
		emoji: '🏘️',
	},
];

const SOCIALS: { icon: keyof typeof Ionicons.glyphMap; label: string; sub: string; url: string }[] = [
	{
		icon: 'logo-discord',
		label: 'Discord',
		sub: 'Live chat with other builders',
		url: 'https://discord.gg/',
	},
	{
		icon: 'logo-twitter',
		label: 'X (Twitter)',
		sub: 'Tips, drops, behind-the-scenes',
		url: 'https://twitter.com/',
	},
	{
		icon: 'mail-outline',
		label: 'Email us',
		sub: 'Bugs, ideas, feedback',
		url: 'mailto:hello@sketchrise.app',
	},
];

export default function Community() {
	return (
		<SafeAreaView className="auth-safe-area">
			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero */}
				<Text className="kicker-accent mb-3">COMMUNITY</Text>
				<Text className="text-4xl font-display text-primary leading-tight mb-3">
					Built by makers,{'\n'}for <Text className="text-accent">makers</Text>.
				</Text>
				<Text className="text-body mb-8">
					Thousands of designers, architects, and DIY home planners turn 2D into 3D every week. Here's what they're building.
				</Text>

				{/* Stats */}
				<View className="flex-row gap-3 mb-10">
					{STATS.map((s) => (
						<View key={s.label} className="flex-1 bg-card rounded-2xl py-5 items-center border border-border">
							<Text className="text-2xl font-display text-accent">{s.value}</Text>
							<Text className="text-[11px] font-label text-muted-foreground mt-1 text-center">
								{s.label}
							</Text>
						</View>
					))}
				</View>

				{/* Featured projects */}
				<Text className="text-xs font-label uppercase tracking-[2px] text-muted-foreground mb-4">
					Featured this week
				</Text>
				<View className="mb-10" style={{ gap: 12 }}>
					{FEATURED.map((p) => (
						<View
							key={p.title}
							className="flex-row items-center bg-card rounded-2xl p-4 border border-border"
						>
							<View
								className="size-14 rounded-xl items-center justify-center mr-4"
								style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}
							>
								<Text className="text-2xl">{p.emoji}</Text>
							</View>
							<View className="flex-1">
								<Text className="text-base font-heading text-primary mb-0.5" numberOfLines={1}>
									{p.title}
								</Text>
								<Text className="text-xs font-label text-muted-foreground uppercase tracking-[1px]">
									{p.author}  ·  {p.date}
								</Text>
							</View>
							<Ionicons name="chevron-forward" size={18} color="rgba(245,240,232,0.4)" />
						</View>
					))}
				</View>

				{/* Connect */}
				<Text className="text-xs font-label uppercase tracking-[2px] text-muted-foreground mb-4">
					Connect with us
				</Text>
				<View style={{ gap: 10 }}>
					{SOCIALS.map((s) => (
						<Pressable
							key={s.label}
							onPress={() => Linking.openURL(s.url)}
							className="flex-row items-center bg-card rounded-2xl px-4 py-4 border border-border"
						>
							<View className="size-10 rounded-xl bg-accent-soft items-center justify-center mr-3">
								<Ionicons name={s.icon} size={20} color="#f59e0b" />
							</View>
							<View className="flex-1">
								<Text className="text-sm font-heading text-primary">{s.label}</Text>
								<Text className="text-xs font-sans text-muted-foreground">{s.sub}</Text>
							</View>
							<Ionicons name="open-outline" size={16} color="rgba(245,240,232,0.4)" />
						</Pressable>
					))}
				</View>

				{/* Footnote */}
				<Text className="text-xs font-label text-muted-foreground text-center mt-10">
					More community features rolling out soon  ✨
				</Text>
			</ScrollView>
		</SafeAreaView>
	);
}
