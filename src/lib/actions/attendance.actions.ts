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
