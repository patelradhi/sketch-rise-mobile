import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/expo';
import { listMyFloorPlans, type FloorPlanJob } from '@/lib/floorPlan.api';

export function useMyFloorPlans() {
	const { isSignedIn, isLoaded } = useAuth();
	const [items, setItems] = useState<FloorPlanJob[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		if (!isSignedIn) {
			setItems([]);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await listMyFloorPlans();
			setItems(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load projects');
		} finally {
			setLoading(false);
		}
	}, [isSignedIn]);

	useEffect(() => {
		if (isLoaded) void refresh();
	}, [isLoaded, refresh]);

	return { items, loading, error, refresh };
}
