/**
 * Community Tab
 *
 * Placeholder screen for the Community section.
 * This will eventually show shared floor plans,
 * user discussions, and featured builds.
 */

import { Text, View } from 'react-native';

export default function Community() {
	return (
		<View className="tab-screen">
			<Text className="tab-title">Community</Text>
			<Text className="text-body mt-2">
				Connect with other architects and designers.
			</Text>
		</View>
	);
}
