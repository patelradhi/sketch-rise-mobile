import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

const { width: SCREEN_W } = Dimensions.get('window');

interface Slide {
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	desc: string;
}

const SLIDES: Slide[] = [
	{
		icon: 'cloud-upload-outline',
		title: 'Upload any sketch',
		desc: 'Hand-drawn or digital — just tap to add your 2D floor plan.',
	},
	{
		icon: 'sparkles-outline',
		title: 'AI does the rest',
		desc: 'Our AI detects rooms, walls, doors, and lighting automatically.',
	},
	{
		icon: 'cube-outline',
		title: 'Get a 3D render',
		desc: 'Photorealistic top-down view of your space in under a minute.',
	},
	{
		icon: 'share-social-outline',
		title: 'Save & share',
		desc: 'Export to your Photos, send via WhatsApp or Email — all in one tap.',
	},
];

interface Props {
	visible: boolean;
	onClose: () => void;
	onTryIt: () => void;
}

export function DemoModal({ visible, onClose, onTryIt }: Props) {
	const [index, setIndex] = useState(0);
	const scrollRef = useRef<ScrollView>(null);
	const isLast = index === SLIDES.length - 1;

	const handleNext = () => {
		if (isLast) {
			onTryIt();
			setIndex(0);
			return;
		}
		const next = index + 1;
		setIndex(next);
		scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
	};

	const handleClose = () => {
		setIndex(0);
		scrollRef.current?.scrollTo({ x: 0, animated: false });
		onClose();
	};

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
			<View className="flex-1 bg-background">
				<SafeAreaView className="flex-1" edges={['top', 'bottom']}>
					{/* Top bar with Skip */}
					<View className="flex-row justify-end px-5 pt-3 pb-2">
						<Pressable onPress={handleClose} hitSlop={12} className="px-3 py-1">
							<Text
								numberOfLines={1}
								className="text-sm font-label uppercase tracking-[2px] text-muted-foreground"
							>
								Skip
							</Text>
						</Pressable>
					</View>

					{/* Swipeable slides */}
					<ScrollView
						ref={scrollRef}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						onMomentumScrollEnd={(e) => {
							const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
							setIndex(newIndex);
						}}
						className="flex-1"
					>
						{SLIDES.map((slide, i) => (
							<View
								key={i}
								style={{ width: SCREEN_W }}
								className="items-center justify-center px-8"
							>
								<View
									className="size-32 rounded-full items-center justify-center mb-8"
									style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}
								>
									<Ionicons name={slide.icon} size={64} color="#f59e0b" />
								</View>
								<Text className="text-3xl font-display text-primary text-center mb-3">
									{slide.title}
								</Text>
								<Text className="text-base font-sans text-muted-foreground text-center leading-6">
									{slide.desc}
								</Text>
							</View>
						))}
					</ScrollView>

					{/* Progress dots */}
					<View className="flex-row justify-center gap-2 mb-8">
						{SLIDES.map((_, i) => (
							<View
								key={i}
								className="rounded-full"
								style={{
									width: i === index ? 24 : 8,
									height: 8,
									backgroundColor: i === index ? '#f59e0b' : 'rgba(245,158,11,0.25)',
								}}
							/>
						))}
					</View>

					{/* CTA */}
					<View className="px-6 pb-6">
						<Pressable
							className="btn-primary flex-row items-center justify-center gap-2"
							onPress={handleNext}
						>
							<Text className="btn-primary-text">
								{isLast ? 'Try it yourself' : 'Next'}
							</Text>
							<Ionicons name="arrow-forward" size={18} color="#0a0900" />
						</Pressable>
					</View>
				</SafeAreaView>
			</View>
		</Modal>
	);
}
