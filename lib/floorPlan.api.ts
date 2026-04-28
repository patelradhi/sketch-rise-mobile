import { apiRequest } from './api';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FloorPlanJob {
	id: string;
	status: JobStatus;
	title: string;
	source2dUrl: string;
	generated3dUrl: string | null;
	structure: unknown | null;
	errorMessage: string | null;
	userName: string;
	userAvatarUrl: string | null;
	createdAt: string;
	completedAt: string | null;
}

export function createFloorPlanJob(body: {
	source2dUrl: string;
	source2dPublicId: string;
	title?: string;
}) {
	return apiRequest<{ jobId: string; status: JobStatus }>('/api/floor-plans', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function getFloorPlanJob(id: string) {
	return apiRequest<FloorPlanJob>(`/api/floor-plans/${id}`);
}

export function listMyFloorPlans() {
	return apiRequest<FloorPlanJob[]>('/api/floor-plans/me');
}

export function renameFloorPlanJob(id: string, title: string) {
	return apiRequest<FloorPlanJob>(`/api/floor-plans/${id}`, {
		method: 'PATCH',
		body: JSON.stringify({ title }),
	});
}

export function deleteFloorPlanJob(id: string) {
	return apiRequest<{ ok: true }>(`/api/floor-plans/${id}`, { method: 'DELETE' });
}
