"use server";

import { getServerHeaders } from './dashboard.actions';
import { API_BASE_URL } from '../constants';
import { revalidatePath } from 'next/cache';

export async function getStudents(params: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  class?: string; 
  fee_status?: string; 
}) {
  try {
    const headers = await getServerHeaders();
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.class) query.append('class', params.class);
    if (params.fee_status) query.append('fee_status', params.fee_status);

    const response = await fetch(`${API_BASE_URL}/students?${query.toString()}`, {
      headers,
      next: { revalidate: 0 }, // No cache for dynamic data
    });

    if (!response.ok) {
      console.error(`getStudents failed: ${response.status} ${response.statusText}`);
      return { students: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
    return await response.json();
  } catch (error) {
    console.error('getStudents network error:', error);
    return { students: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }
}

export async function createStudent(formData: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to create student' };

    revalidatePath('/dashboard/students');
    return { success: true, student: result.student };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function getStudentById(id: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`getStudentById failed: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('getStudentById network error:', error);
    return null;
  }
}
