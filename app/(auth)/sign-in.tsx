/**
 * Sign In Screen
 *
 * THREE-STEP FLOW ON NATIVE:
 * 1. signIn.create({ identifier }) → tells Clerk which user
 * 2. attemptFirstFactor({ strategy: 'password', password }) → verifies password
 * 3. If 2FA is enabled → attemptSecondFactor({ strategy: 'email_code' })
 *    → user enters the 6-digit code from their email
 *
 * On web, Clerk handles steps 1-2 in one call. On native, each step
 * must be explicit. Step 3 only happens if the Clerk dashboard has
 * email verification or 2FA enabled for sign-in.
 */

import { useAuth } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { ClerkAPIError } from '@/types';
import { inputFieldStyle, inputCodeStyle, PLACEHOLDER_COLOR } from '@/constants/styles';

interface SignInForm {
	emailAddress: string;
	password: string;
	code: string;
	phase: 'credentials' | 'verify';
	error: string | null;
	emailError: string | null;
	passwordError: string | null;
	submitting: boolean;
}

export default function SignIn() {
	const { isSignedIn } = useAuth();
	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();

	if (isSignedIn) {
		return <Redirect href="/(tabs)" />;
	}

	const [form, setForm] = useState<SignInForm>({
		emailAddress: '',
		password: '',
		code: '',
		phase: 'credentials',
		error: null,
		emailError: null,
		passwordError: null,
		submitting: false,
	});

	const [showPassword, setShowPassword] = useState(false);

	const updateForm = (updates: Partial<SignInForm>) => setForm((prev) => ({ ...prev, ...updates }));

	const validate = (): boolean => {
		let emailError: string | null = null;
		let passwordError: string | null = null;

		const trimmed = form.emailAddress.trim();
		if (!trimmed) {
			emailError = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
			emailError = 'Enter a valid email address';
		}

		if (!form.password) {
			passwordError = 'Password is required';
		} else if (form.password.length < 8) {
			passwordError = 'Password must be at least 8 characters';
		}

		updateForm({ emailError, passwordError });
		return !emailError && !passwordError;
	};

	// Step 1 + 2: Submit email + password
	const onSubmit = async () => {
		if (!isLoaded) return;
		if (!validate()) return;

		updateForm({ error: null, submitting: true });
		try {
			const email = form.emailAddress.trim().toLowerCase();

			// Create sign-in with identifier
			const attempt = await signIn.create({ identifier: email });

			// Verify password as first factor
			const result = await attempt.attemptFirstFactor({
				strategy: 'password',
				password: form.password,
			});

			if (result.status === 'complete') {
				await setActive({ session: result.createdSessionId });
				router.back();
			} else if (result.status === 'needs_second_factor') {
				await signIn.prepareSecondFactor({
					strategy: 'email_code',
				});
				updateForm({ phase: 'verify' });
			} else {
				updateForm({ error: `Unexpected status: ${result.status}` });
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

	// Step 3: Verify the 2FA email code
	const onVerify = async () => {
		if (!isLoaded) return;
		updateForm({ error: null, submitting: true });
		try {
			const result = await signIn.attemptSecondFactor({
				strategy: 'email_code',
				code: form.code,
			});

			if (result.status === 'complete') {
				await setActive({ session: result.createdSessionId });
				router.back();
			} else {
				updateForm({ error: `Verification status: ${result.status}` });
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
			{form.phase === 'credentials' ? (
				<>
					{/* Logo */}
					<View className="items-center mb-10">
						<View className="flex-row items-center gap-3 mb-1">
							<View className="auth-logo-mark">
								<Text className="auth-logo-mark-text">S</Text>
							</View>
							<Text className="auth-wordmark">SketchRise</Text>
						</View>
						<Text className="auth-wordmark-sub">CREATIVE SKETCHING</Text>
					</View>

					{/* Heading */}
					<View className="items-center mb-8">
						<Text className="auth-title">Welcome back</Text>
						<Text className="auth-subtitle">Sign in to continue your creative journey</Text>
					</View>

					{/* Email */}
					<Text className="text-label mb-1 ml-1">Email</Text>
					<TextInput
						style={inputFieldStyle}
						placeholder="you@example.com"
						placeholderTextColor={PLACEHOLDER_COLOR}
						autoCapitalize="none"
						keyboardType="email-address"
						value={form.emailAddress}
						onChangeText={(v) => updateForm({ emailAddress: v, emailError: null })}
					/>
					{form.emailError && <Text className="error-text">{form.emailError}</Text>}

					{/* Password */}
					<Text className="text-label mb-1 ml-1">Password</Text>
					<View className="relative">
						<TextInput
							style={{ ...inputFieldStyle, paddingRight: 48 }}
							placeholder="Enter your password"
							placeholderTextColor={PLACEHOLDER_COLOR}
							secureTextEntry={!showPassword}
							value={form.password}
							onChangeText={(v) => updateForm({ password: v, passwordError: null })}
						/>
						<Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-3">
							<Ionicons
								name={showPassword ? 'eye-off-outline' : 'eye-outline'}
								size={22}
								color="rgba(245,240,232,0.4)"
							/>
						</Pressable>
					</View>
					{form.passwordError && <Text className="error-text">{form.passwordError}</Text>}

					{/* Server error */}
					{form.error && <Text className="error-text">{form.error}</Text>}

					{/* Submit */}
					<Pressable
						onPress={onSubmit}
						disabled={form.submitting}
						className="btn-primary mb-4"
						style={form.submitting ? { opacity: 0.6 } : undefined}
					>
						<Text className="btn-primary-text">{form.submitting ? 'Signing in\u2026' : 'Sign in'}</Text>
					</Pressable>

					{/* Sign-up link */}
					<Pressable onPress={() => router.replace('/sign-up')} className="flex-row justify-center">
						<Text className="text-body">New to SketchRise? </Text>
						<Text className="btn-link-text">Create an account</Text>
					</Pressable>
				</>
			) : (
				<>
					<Text className="auth-title mb-2">Verify your identity</Text>
					<Text className="text-body mb-8">We sent a 6-digit code to {form.emailAddress}.</Text>

					<TextInput
						style={inputCodeStyle}
						placeholder="123456"
						placeholderTextColor={PLACEHOLDER_COLOR}
						keyboardType="number-pad"
						maxLength={6}
						value={form.code}
						onChangeText={(v) => updateForm({ code: v })}
					/>

					{form.error && <Text className="error-text">{form.error}</Text>}

					<Pressable
						onPress={onVerify}
						disabled={form.submitting}
						className="btn-primary"
						style={form.submitting ? { opacity: 0.6 } : undefined}
					>
						<Text className="btn-primary-text">{form.submitting ? 'Verifying\u2026' : 'Verify'}</Text>
					</Pressable>
				</>
			)}
		</View>
	);
}
