/**
 * Auth Group Layout
 *
 * This layout wraps sign-in and sign-up screens.
 * NO redirect logic here — sign-in/sign-up screens handle
 * navigation themselves using router.back() after success.
 *
 * WHY no redirect?
 * Expo Router on native can't reliably resolve routes across
 * sibling groups ((auth) → (tabs)). Using <Redirect> or
 * router.replace() with a (tabs) route causes "path.split
 * is not a function" because the path resolves to undefined.
 *
 * Instead, after sign-in succeeds, we call router.back()
 * which pops back to the landing page. The landing page
 * detects isSignedIn and updates the UI (shows avatar).
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}
