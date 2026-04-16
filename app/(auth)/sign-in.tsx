import { useSignIn } from '@clerk/expo/legacy';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { ClerkAPIError, SignInFormState } from '@/types';

export default function SignIn() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();

	const [form, setForm] = useState<SignInFormState>({
		emailAddress: '',
		password: '',
		error: null,
		submitting: false,
	});

	const updateForm = (updates: Partial<SignInFormState>) =>
		setForm((prev) => ({ ...prev, ...updates }));

	const onSubmit = async () => {
		if (!isLoaded) return;
		updateForm({ error: null, submitting: true });
		try {
			const attempt = await signIn.create({ identifier: form.emailAddress, password: form.password });
			if (attempt.status === 'complete') {
				await setActive({ session: attempt.createdSessionId });
				router.replace('/home');
			} else {
				updateForm({ error: 'Sign-in incomplete. Check your credentials.' });
			}
		} catch (err) {
			const clerkErr = err as ClerkAPIError;
			updateForm({
				error: clerkErr?.errors?.[0]?.longMessage ?? clerkErr?.message ?? 'Sign-in failed',
			});
		} finally {
			updateForm({ submitting: false });
		}
	};

	return (
		<View className="auth-screen">
			<Text className="auth-title mb-8">Welcome back</Text>

			<TextInput
				className="input-field"
				placeholder="Email"
				placeholderTextColor="rgba(245,240,232,0.3)"
				autoCapitalize="none"
				keyboardType="email-address"
				value={form.emailAddress}
				onChangeText={(v) => updateForm({ emailAddress: v })}
			/>
			<TextInput
				className="input-field"
				placeholder="Password"
				placeholderTextColor="rgba(245,240,232,0.3)"
				secureTextEntry
				value={form.password}
				onChangeText={(v) => updateForm({ password: v })}
			/>

			{form.error && <Text className="error-text">{form.error}</Text>}

			<Pressable onPress={onSubmit} disabled={form.submitting} className="btn-primary mb-4">
				<Text className="btn-primary-text">
					{form.submitting ? 'Signing in…' : 'Sign In'}
				</Text>
			</Pressable>

			<Pressable onPress={() => router.replace('/sign-up')} className="flex-row justify-center">
				<Text className="text-body">No account? </Text>
				<Text className="btn-link-text">Sign up</Text>
			</Pressable>
		</View>
	);
}
