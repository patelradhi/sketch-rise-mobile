/* ──────────────────────────────────────────────
 *  App-wide type definitions
 *  Import: import type { ... } from '@/types';
 * ────────────────────────────────────────────── */

// ── Auth ──

export type AuthPhase = 'form' | 'verify';

export interface AuthError {
	message: string;
	code?: string;
	longMessage?: string;
}

export interface SignInFormState {
	emailAddress: string;
	password: string;
	error: string | null;
	submitting: boolean;
}

export interface SignUpFormState {
	emailAddress: string;
	password: string;
	code: string;
	phase: AuthPhase;
	error: string | null;
	submitting: boolean;
}

// ── Clerk ──

export interface ClerkAPIError {
	errors?: Array<{
		code: string;
		message: string;
		longMessage?: string;
	}>;
	message?: string;
}

// ── Navigation ──

export type AppRoute = '/' | '/home' | '/sign-in' | '/sign-up';

// ── Theme ──

export type ThemeColor =
	| 'background'
	| 'foreground'
	| 'card'
	| 'muted'
	| 'muted-foreground'
	| 'primary'
	| 'accent'
	| 'border'
	| 'success'
	| 'destructive'
	| 'subscription';

export type FontFamily =
	| 'font-sans'
	| 'font-thin'
	| 'font-label'
	| 'font-emphasis'
	| 'font-heading'
	| 'font-display';

// ── Common ──

export interface StatItem {
	value: string;
	label: string;
}

export interface ButtonProps {
	onPress?: () => void;
	disabled?: boolean;
	children: React.ReactNode;
}
