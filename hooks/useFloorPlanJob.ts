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

			console.log(`[flow] start  localUri=${localUri}`);
			try {
				setStatus('uploading');
				console.log('[flow] phase=uploading');
				const { secure_url, public_id } = await uploadToCloudinary(localUri);

				console.log('[flow] creating backend job...');
				const created = await createFloorPlanJob({
					source2dUrl: secure_url,
					source2dPublicId: public_id,
				});
				console.log(`[flow] backend job created  jobId=${created.jobId}  status=${created.status}`);

				setStatus('generating');
				console.log('[flow] phase=generating (polling every 2s)');

				intervalRef.current = setInterval(async () => {
					try {
						const latest = await getFloorPlanJob(created.jobId);
						console.log(`[flow] poll  jobId=${latest.id}  status=${latest.status}`);
						setJob(latest);

						if (latest.status === 'completed') {
							clearPolling();
							setStatus('completed');
							console.log(`[flow] phase=completed  jobId=${latest.id}`);
							router.push(`/result/${latest.id}` as never);
						} else if (latest.status === 'failed') {
							clearPolling();
							setStatus('failed');
							console.warn(`[flow] phase=failed  jobId=${latest.id}  reason=${latest.errorMessage}`);
							setError(latest.errorMessage ?? 'Generation failed');
						}
					} catch (pollErr) {
						clearPolling();
						setStatus('failed');
						console.error('[flow] polling error', pollErr);
						setError(pollErr instanceof Error ? pollErr.message : 'Polling failed');
					}
				}, POLL_INTERVAL_MS);
			} catch (err) {
				setStatus('failed');
				console.error('[flow] upload/create failed', err);
				setError(err instanceof Error ? err.message : 'Upload failed');
			}
		},
		[clearPolling, router],
	);

	return { start, reset, status, job, error };
}
