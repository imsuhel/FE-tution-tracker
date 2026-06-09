"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

async function getServerHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getBatches() {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/batches`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`getBatches failed: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.batches || [];
  } catch (error) {
    console.error('getBatches network error:', error);
    return [];
  }
}

export async function createBatch(formData: any) {
  try {
    const headers = await getServerHeaders();
    
    // Process days array from formData if necessary
    // In our UI we might send it as multiple checkboxes or a JSON string
    
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to create batch' };

    revalidatePath('/dashboard/batches');
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function getBatchStudents(batchId: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}/students`, {
      headers,
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error('Failed to fetch batch students');
    const data = await response.json();
    return data.students || [];
  } catch (error) {
    console.error('getBatchStudents error:', error);
    return [];
  }
}

export async function getBatchById(id: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`getBatchById failed: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data.batch;
  } catch (error) {
    console.error('getBatchById network error:', error);
    return null;
  }
}

export async function enrollStudent(batchId: string, studentId: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}/enroll`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ student_id: studentId }),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to enroll student' };

    revalidatePath(`/dashboard/batches/${batchId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function unenrollStudent(batchId: string, studentId: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}/enroll/${studentId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const result = await response.json();
      return { error: result.error || 'Failed to unenroll student' };
    }

    revalidatePath(`/dashboard/batches/${batchId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function updateBatch(id: string, data: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to update batch' };

    revalidatePath('/dashboard/batches');
    revalidatePath(`/dashboard/batches/${id}`);
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}
