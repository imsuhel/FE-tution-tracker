"use server";

import { getServerHeaders } from './dashboard.actions';
import { API_BASE_URL } from '../constants';
import { revalidatePath } from 'next/cache';

export async function getTeachers(params: { role?: string } = {}) {
  try {
    const headers = await getServerHeaders();
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);

    const response = await fetch(`${API_BASE_URL}/teachers?${query.toString()}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`getTeachers failed: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.teachers || [];
  } catch (error) {
    console.error('getTeachers network error:', error);
    return [];
  }
}

export async function createTeacher(formData: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to create teacher' };

    revalidatePath('/dashboard/teachers');
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}
