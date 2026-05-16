const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

let getToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
	getToken = fn;
}

export class ApiError extends Error {
	status: number;
	code: string;
	constructor(status: number, code: string, message: string) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
	const token = getToken ? await getToken() : null;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'ngrok-skip-browser-warning': 'true',
		...(init.headers as Record<string, string> | undefined),
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const method = init.method ?? 'GET';
	const url = `${BASE_URL}${path}`;
	const startedAt = Date.now();
	console.log(`[api] → ${method} ${url}${token ? ' (auth)' : ' (no-auth)'}`);

	const res = await fetch(url, { ...init, headers });
	const ms = Date.now() - startedAt;

	if (!res.ok) {
		let body: { code?: string; message?: string } = {};
		try {
			body = await res.json();
		} catch {
			/* non-JSON error */
		}
		console.warn(`[api] ← ${method} ${url}  ${res.status}  ${ms}ms  ${body.code ?? 'http_error'}: ${body.message ?? res.statusText}`);
		throw new ApiError(res.status, body.code ?? 'http_error', body.message ?? res.statusText);
	}

	console.log(`[api] ← ${method} ${url}  ${res.status}  ${ms}ms`);
	return res.json() as Promise<T>;
}
