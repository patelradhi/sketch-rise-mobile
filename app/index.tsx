import { Button, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function App() {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="text-xl font-bold text-success">Welcome to Sketchrise!</Text>
			<Link href="/onBoarding" className=" mt-4 text-blue-500 rounded bg-primary text-white px-4 py-2">
				Go to Onboarding
			</Link>
		</View>
	);
}
