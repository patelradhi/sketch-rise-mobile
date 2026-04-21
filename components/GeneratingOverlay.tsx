import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Image } from 'expo-image';

interface Props {
	sourceUri: string;
}

export function GeneratingOverlay({ sourceUri }: Props) {
	const pulse = useRef(new Animated.Value(0.4)).current;

	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
				Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
			]),
		);
		loop.start();
		return () => loop.stop();
	}, [pulse]);

	return (
		<Animated.View className="upload-generating" style={{ opacity: pulse }} pointerEvents="none">
			<View className="w-full rounded-lg overflow-hidden mb-4" style={{ opacity: 0.6 }}>
				<Image
					source={{ uri: sourceUri }}
					style={{ width: '100%', height: 180 }}
					contentFit="cover"
				/>
			</View>
			<Text className="upload-title">Generating your 3D render…</Text>
			<Text className="upload-hint">This usually takes under a minute</Text>
		</Animated.View>
	);
}
