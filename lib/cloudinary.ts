const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
}

export async function uploadToCloudinary(localUri: string): Promise<CloudinaryUploadResult> {
	const form = new FormData();
	const match = /\.(\w+)$/.exec(localUri);
	const ext = match?.[1]?.toLowerCase() ?? 'jpg';
	const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

	form.append('file', { uri: localUri, name: `plan.${ext}`, type: mime } as unknown as Blob);
	form.append('upload_preset', UPLOAD_PRESET);

	const startedAt = Date.now();
	console.log(`[cloudinary] → upload start  cloud=${CLOUD_NAME}  mime=${mime}  uri=${localUri}`);

	const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
		method: 'POST',
		body: form,
	});

	const text = await res.text();
	const ms = Date.now() - startedAt;
	if (!res.ok) {
		console.error(`[cloudinary] ← upload FAILED  ${res.status}  ${ms}ms`, text);
		throw new Error(`Cloudinary upload failed (${res.status}): ${text}`);
	}

	const json = JSON.parse(text) as { secure_url: string; public_id: string };
	console.log(`[cloudinary] ← upload ok  ${ms}ms  publicId=${json.public_id}  url=${json.secure_url}`);
	return { secure_url: json.secure_url, public_id: json.public_id };
}
