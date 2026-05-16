import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface Props {
	beforeUri: string;
	afterUri: string;
	aspectRatio?: number;
}

const HANDLE_HIT_WIDTH = 44;
const KNOB_SIZE = 36;
const LINE_WIDTH = 2;

export function BeforeAfterSlider({ beforeUri, afterUri, aspectRatio = 4 / 3 }: Props) {
	const [containerWidth, setContainerWidth] = useState(0);
	const sliderX = useSharedValue(0);
	const containerWidthSV = useSharedValue(0);
	const startX = useSharedValue(0);

	const handleLayout = (e: LayoutChangeEvent) => {
		const w = e.nativeEvent.layout.width;
		setContainerWidth(w);
		containerWidthSV.value = w;
		sliderX.value = w / 2;
	};

	const pan = Gesture.Pan()
		.onStart(() => {
			startX.value = sliderX.value;
		})
		.onUpdate((e) => {
			const next = startX.value + e.translationX;
			const max = containerWidthSV.value;
			sliderX.value = next < 0 ? 0 : next > max ? max : next;
		});

	// Top layer (BEFORE) is clipped from the right by setting its width
	const beforeClipStyle = useAnimatedStyle(() => ({
		width: sliderX.value,
	}));

	// Handle is centered horizontally on sliderX
	const handleStyle = useAnimatedStyle(() => ({
		left: sliderX.value - HANDLE_HIT_WIDTH / 2,
	}));

	return (
		<View className="bg-card border border-border rounded-3xl overflow-hidden">
			{/* Header — kicker + title left, "DRAG TO COMPARE" right */}
			<View className="flex-row items-start justify-between px-5 pt-4 pb-3">
				<View>
					<Text className="text-[10px] font-label text-muted-foreground tracking-widest">COMPARISON</Text>
					<Text className="text-lg font-heading text-primary mt-1">Before and After</Text>
				</View>
				<View className="flex-row items-center gap-1.5 pt-1">
					<Ionicons name="code-outline" size={12} color="#8b8580" />
					<Text className="text-[10px] font-label text-muted-foreground tracking-widest">
						DRAG TO COMPARE
					</Text>
				</View>
			</View>

			{/* Cream container (16px margin from outer dark) — matches the first wrapper's structure */}
			<View className="mx-3 mb-3 rounded-2xl p-4" style={{ backgroundColor: '#f5f0e8' }}>
				{/* Image holder — sized via aspectRatio, fills the cream's inner area */}
				<View
					className="rounded-xl overflow-hidden"
					style={{ width: '100%', aspectRatio }}
					onLayout={handleLayout}
				>
					{/* Bottom layer — AFTER (3D render), full width */}
					<Image
						source={{ uri: afterUri }}
						style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
						contentFit="contain"
					/>

					{/* Top layer — BEFORE (2D sketch), clipped from the right by sliderX */}
					<Animated.View
						style={[
							{ position: 'absolute', top: 0, left: 0, bottom: 0, overflow: 'hidden' },
							beforeClipStyle,
						]}
					>
						{containerWidth > 0 && (
							<Image
								source={{ uri: beforeUri }}
								style={{ width: containerWidth, height: '100%' }}
								contentFit="contain"
							/>
						)}
					</Animated.View>

					{/* Drag handle — vertical line + circular knob (only this is gesture-active) */}
					<GestureDetector gesture={pan}>
						<Animated.View
							style={[
								{
									position: 'absolute',
									top: 0,
									bottom: 0,
									width: HANDLE_HIT_WIDTH,
									alignItems: 'center',
									justifyContent: 'center',
								},
								handleStyle,
							]}
						>
							<View
								style={{
									position: 'absolute',
									top: 0,
									bottom: 0,
									width: LINE_WIDTH,
									backgroundColor: '#ffffff',
								}}
							/>
							<View
								style={{
									width: KNOB_SIZE,
									height: KNOB_SIZE,
									borderRadius: KNOB_SIZE / 2,
									backgroundColor: '#1a1a1a',
									borderWidth: 2,
									borderColor: '#ffffff',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Ionicons name="chevron-back" size={12} color="#ffffff" />
								<Ionicons name="chevron-forward" size={12} color="#ffffff" />
							</View>
						</Animated.View>
					</GestureDetector>
				</View>
			</View>
		</View>
	);
}
