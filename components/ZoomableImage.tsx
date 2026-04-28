import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Props {
	uri: string;
	onLoad?: (w: number, h: number) => void;
}

export function ZoomableImage({ uri, onLoad }: Props) {
	const scale = useSharedValue(1);
	const savedScale = useSharedValue(1);
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const savedTranslateX = useSharedValue(0);
	const savedTranslateY = useSharedValue(0);

	const pinch = Gesture.Pinch()
		.onUpdate((e) => {
			scale.value = savedScale.value * e.scale;
		})
		.onEnd(() => {
			if (scale.value < 1) {
				scale.value = withTiming(1);
				savedScale.value = 1;
				translateX.value = withTiming(0);
				translateY.value = withTiming(0);
				savedTranslateX.value = 0;
				savedTranslateY.value = 0;
			} else if (scale.value > 4) {
				scale.value = withTiming(4);
				savedScale.value = 4;
			} else {
				savedScale.value = scale.value;
			}
		});

	const pan = Gesture.Pan()
		.onUpdate((e) => {
			translateX.value = savedTranslateX.value + e.translationX;
			translateY.value = savedTranslateY.value + e.translationY;
		})
		.onEnd(() => {
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		});

	const doubleTap = Gesture.Tap()
		.numberOfTaps(2)
		.onStart(() => {
			if (scale.value > 1) {
				scale.value = withTiming(1);
				savedScale.value = 1;
				translateX.value = withTiming(0);
				translateY.value = withTiming(0);
				savedTranslateX.value = 0;
				savedTranslateY.value = 0;
			} else {
				scale.value = withTiming(2);
				savedScale.value = 2;
			}
		});

	const composed = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: translateX.value },
			{ translateY: translateY.value },
			{ scale: scale.value },
		],
	}));

	return (
		<GestureDetector gesture={composed}>
			<Animated.View style={[{ flex: 1 }, animatedStyle]}>
				<Image
					source={{ uri }}
					style={{ width: '100%', height: '100%' }}
					contentFit="contain"
					onLoad={(e) => {
						const w = e.source?.width;
						const h = e.source?.height;
						if (w && h) onLoad?.(w, h);
					}}
				/>
			</Animated.View>
		</GestureDetector>
	);
}
