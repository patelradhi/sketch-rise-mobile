import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

interface Plan {
	id: 'free' | 'basic' | 'premium';
	name: string;
	price: string;
	period: string;
	tagline: string;
	highlight?: 'popular' | 'best';
	features: string[];
	cta: string;
}

const PLANS: Plan[] = [
	{
		id: 'free',
		name: 'Free',
		price: '$0',
		period: 'forever',
		tagline: 'Try every core feature, no credit card.',
		features: ['5 floor plans / month', 'Standard 3D rendering', 'PNG export', 'WhatsApp & Email share'],
		cta: 'Get started',
	},
	{
		id: 'basic',
		name: 'Basic',
		price: '$9',
		period: 'per month',
		tagline: 'For weekend designers and home planners.',
		highlight: 'popular',
		features: [
			'50 floor plans / month',
			'Priority rendering queue',
			'High-resolution exports',
			'Project history & rename',
			'Email support',
		],
		cta: 'Choose Basic',
	},
	{
		id: 'premium',
		name: 'Premium',
		price: '$19',
		period: 'per month',
		tagline: 'For studios and serious architects.',
		highlight: 'best',
		features: [
			'Unlimited floor plans',
			'4K render quality',
			'Advanced room detection',
			'Interactive 3D viewer (early access)',
			'Priority support, < 4h reply',
		],
		cta: 'Go Premium',
	},
];

function PlanCard({ plan, onCta }: { plan: Plan; onCta: () => void }) {
	const isPopular = plan.highlight === 'popular';
	const isBest = plan.highlight === 'best';
	const accentColor = isBest ? '#8fd1bd' : '#f59e0b';
	const isFilledCta = isPopular || isBest;

	return (
		<View
			className="rounded-3xl p-6 mb-4 bg-card"
			style={{
				borderColor: isPopular ? '#f59e0b' : isBest ? '#8fd1bd' : 'rgba(245,158,11,0.15)',
				borderWidth: isPopular || isBest ? 1.5 : 1,
			}}
		>
			{plan.highlight && (
				<View
					className="absolute -top-3 left-6 px-3 py-1 rounded-full"
					style={{ backgroundColor: accentColor }}
				>
					<Text className="text-[10px] font-display uppercase tracking-[1.5px] text-background">
						{isPopular ? 'Most popular' : 'Best value'}
					</Text>
				</View>
			)}

			<Text className="text-xs font-label uppercase tracking-[2px] text-muted-foreground mb-2">{plan.name}</Text>
			<View className="flex-row items-baseline gap-2 mb-1">
				<Text className="text-4xl font-display text-primary">{plan.price}</Text>
				<Text className="text-sm font-label text-muted-foreground">{plan.period}</Text>
			</View>
			<Text className="text-sm font-sans text-muted-foreground mb-5">{plan.tagline}</Text>

			<View className="mb-6" style={{ gap: 10 }}>
				{plan.features.map((f) => (
					<View key={f} className="flex-row items-center gap-2">
						<Ionicons name="checkmark-circle" size={16} color={accentColor} />
						<Text className="text-sm font-sans text-primary">{f}</Text>
					</View>
				))}
			</View>

			<Pressable
				onPress={onCta}
				className="rounded-xl py-3 items-center"
				style={{
					backgroundColor: isFilledCta ? accentColor : 'transparent',
					borderWidth: isFilledCta ? 0 : 1,
					borderColor: 'rgba(245,158,11,0.3)',
				}}
			>
				<Text className="text-base font-heading" style={{ color: isFilledCta ? '#0a0900' : '#f5f0e8' }}>
					{plan.cta}
				</Text>
			</Pressable>
		</View>
	);
}

export default function Pricing() {
	const router = useRouter();

	const handleCta = (plan: Plan) => {
		if (plan.id === 'free') {
			router.push('/?scroll=upload' as never);
		} else {
			Alert.alert('Coming soon', 'Subscriptions will activate in a future release.');
		}
	};

	return (
		<SafeAreaView className="auth-safe-area">
			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 }}
				showsVerticalScrollIndicator={false}
			>
				<Text className="kicker-accent mb-3">PRICING</Text>
				<Text
					className="text-3xl font-display text-primary leading-tight mb-3"
					numberOfLines={1}
					adjustsFontSizeToFit
				>
					Pick a plan, start <Text className="text-accent">building</Text>.
				</Text>
				<Text className="text-body mb-8">
					Cancel anytime. Every plan includes core 3D generation. Upgrade only when you outgrow free.
				</Text>

				{PLANS.map((p) => (
					<PlanCard key={p.id} plan={p} onCta={() => handleCta(p)} />
				))}

				<View className="flex-row items-center justify-center gap-2 mt-3">
					<Ionicons name="lock-closed-outline" size={12} color="rgba(245,240,232,0.5)" />
					<Text className="text-xs font-label text-muted-foreground">
						Secure billing · Cancel anytime · No hidden fees
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
