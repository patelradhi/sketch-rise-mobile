import { useClerk, useUser } from '@clerk/expo';
import { Pressable, Text, View } from 'react-native';

export default function Home() {
	const { user } = useUser();
	const { signOut } = useClerk();

	return (
		<View className="auth-screen">
			<Text className="auth-title mb-2">Welcome</Text>
			<Text className="text-body mb-10">
				{user?.primaryEmailAddress?.emailAddress ?? 'Signed in'}
			</Text>

			<Pressable onPress={() => signOut()} className="btn-primary">
				<Text className="btn-primary-text">Sign out</Text>
			</Pressable>
		</View>
	);
}
