import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import {
	createFloorPlanJob,
	getFloorPlanJob,
	type FloorPlanJob,
} from '@/lib/floorPlan.api';

export type JobPhase = 'idle' | 'uploading' | 'generating' | 'completed' | 'failed';

const POLL_INTERVAL_MS = 2000;

export function useFloorPlanJob() {
	const router = useRouter();
	const [status, setStatus] = useState<JobPhase>('idle');
	const [job, setJob] = useState<FloorPlanJob | null>(null);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const clearPolling = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	const reset = useCallback(() => {
		clearPolling();
		setStatus('idle');
		setJob(null);
		setError(null);
	}, [clearPolling]);

	useEffect(() => () => clearPolling(), [clearPolling]);

	const start = useCallback(
		async (localUri: string) => {
			clearPolling();
			setError(null);
			setJob(null);

			try {
				setStatus('uploading');
				const { secure_url, public_id } = await uploadToCloudinary(localUri);

				const created = await createFloorPlanJob({
					source2dUrl: secure_url,
					source2dPublicId: public_id,
				});

				setStatus('generating');

				intervalRef.current = setInterval(async () => {
					try {
						const latest = await getFloorPlanJob(created.jobId);
						setJob(latest);

						if (latest.status === 'completed') {
							clearPolling();
							setStatus('completed');
							router.push(`/result/${latest.id}` as never);
						} else if (latest.status === 'failed') {
							clearPolling();
							setStatus('failed');
							setError(latest.errorMessage ?? 'Generation failed');
						}
					} catch (pollErr) {
						clearPolling();
						setStatus('failed');
						setError(pollErr instanceof Error ? pollErr.message : 'Polling failed');
					}
				}, POLL_INTERVAL_MS);
			} catch (err) {
				setStatus('failed');
				setError(err instanceof Error ? err.message : 'Upload failed');
			}
		},
		[clearPolling, router],
	);

	return { start, reset, status, job, error };
}
