"use server";

import { getServerHeaders } from './dashboard.actions';
import { API_BASE_URL } from '../constants';
import { revalidatePath } from 'next/cache';

export async function getBatchAttendance(batchId: string, date: string) {
  try {
    const headers = await getServerHeaders();
    const query = new URLSearchParams({
      batch_id: batchId,
      start_date: date,
      end_date: date,
    });

    const response = await fetch(`${API_BASE_URL}/attendance?${query.toString()}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) return { attendance: [] };
    return await response.json();
  } catch (error) {
    console.error('getBatchAttendance failed:', error);
    return { attendance: [] };
  }
}

/**
 * Fetches today's present-student count for every batch in parallel.
 * Returns a map: { [batchId]: presentCount }
 */
export async function getTodayAttendanceSummary(batchIds: string[]): Promise<Record<string, number>> {
  if (!batchIds.length) return {};

  const today = new Date().toISOString().split('T')[0];
  const headers = await getServerHeaders();

  const results = await Promise.all(
    batchIds.map(async (batchId) => {
      try {
        const query = new URLSearchParams({
          batch_id: batchId,
          start_date: today,
          end_date: today,
        });
        const res = await fetch(`${API_BASE_URL}/attendance?${query.toString()}`, {
          headers,
          next: { revalidate: 0 },
        });
        if (!res.ok) return { batchId, count: 0 };
        const data = await res.json();
        const presentCount = (data.attendance || []).filter(
          (r: any) => r.status === 'present'
        ).length;
        return { batchId, count: presentCount };
      } catch {
        return { batchId, count: 0 };
      }
    })
  );

  return Object.fromEntries(results.map(({ batchId, count }) => [batchId, count]));
}

export async function markBatchAttendance(data: {
  batch_id: string;
  date: string;
  records: Array<{
    student_id: string;
    enrollment_id: string;
    status: 'present' | 'absent' | 'holiday';
  }>;
}) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to mark attendance' };

    revalidatePath(`/dashboard/batches/${data.batch_id}/attendance`);
    return { success: true };
  } catch (error) {
    console.error('markBatchAttendance failed:', error);
    return { error: 'Internal server error' };
  }
}
