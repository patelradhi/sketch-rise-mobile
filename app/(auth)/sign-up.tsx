import { useSignUp } from '@clerk/expo/legacy';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { ClerkAPIError, SignUpFormState } from '@/types';

export default function SignUp() {
	const { signUp, setActive, isLoaded } = useSignUp();
	const router = useRouter();

	const [form, setForm] = useState<SignUpFormState>({
		emailAddress: '',
		password: '',
		code: '',
		phase: 'form',
		error: null,
		submitting: false,
	});

	const updateForm = (updates: Partial<SignUpFormState>) =>
		setForm((prev) => ({ ...prev, ...updates }));

	const onCreate = async () => {
		if (!isLoaded) return;
		updateForm({ error: null, submitting: true });
		try {
			await signUp.create({ emailAddress: form.emailAddress, password: form.password });
			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
			updateForm({ phase: 'verify' });
		} catch (err) {
			const clerkErr = err as ClerkAPIError;
			updateForm({
				error: clerkErr?.errors?.[0]?.longMessage ?? clerkErr?.message ?? 'Sign-up failed',
			});
		} finally {
			updateForm({ submitting: false });
		}
	};

	const onVerify = async () => {
		if (!isLoaded) return;
		updateForm({ error: null, submitting: true });
		try {
			const attempt = await signUp.attemptEmailAddressVerification({ code: form.code });
			if (attempt.status === 'complete') {
				await setActive({ session: attempt.createdSessionId });
				router.replace('/home');
			} else {
				updateForm({ error: 'Verification incomplete. Check the code and try again.' });
			}
		} catch (err) {
			const clerkErr = err as ClerkAPIError;
			updateForm({
				error: clerkErr?.errors?.[0]?.longMessage ?? clerkErr?.message ?? 'Verification failed',
			});
		} finally {
			updateForm({ submitting: false });
		}
	};

	return (
		<View className="auth-screen">
			{form.phase === 'form' ? (
				<>
					<Text className="auth-title mb-8">Create account</Text>

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

					<Pressable onPress={onCreate} disabled={form.submitting} className="btn-primary mb-4">
						<Text className="btn-primary-text">
							{form.submitting ? 'Creating…' : 'Create Account'}
						</Text>
					</Pressable>

					<Pressable onPress={() => router.replace('/sign-in')} className="flex-row justify-center">
						<Text className="text-body">Already have an account? </Text>
						<Text className="btn-link-text">Sign in</Text>
					</Pressable>
				</>
			) : (
				<>
					<Text className="auth-title mb-2">Verify your email</Text>
					<Text className="text-body mb-8">
						We sent a 6-digit code to {form.emailAddress}.
					</Text>

					<TextInput
						className="input-code"
						placeholder="123456"
						placeholderTextColor="rgba(245,240,232,0.3)"
						keyboardType="number-pad"
						maxLength={6}
						value={form.code}
						onChangeText={(v) => updateForm({ code: v })}
					/>

					{form.error && <Text className="error-text">{form.error}</Text>}

					<Pressable onPress={onVerify} disabled={form.submitting} className="btn-primary">
						<Text className="btn-primary-text">
							{form.submitting ? 'Verifying…' : 'Verify'}
						</Text>
					</Pressable>
				</>
			)}
		</View>
	);
}
