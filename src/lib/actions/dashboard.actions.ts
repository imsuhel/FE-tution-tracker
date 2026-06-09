"use server";

import { cookies } from 'next/headers';
import { API_BASE_URL } from '../constants';

export async function getServerHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getDashboardStats() {
  try {
    const headers = await getServerHeaders();
    // Assuming we have a stats endpoint or we calculate them from other endpoints
    // For now, let's fetch students, batches, and courses to get basic counts
    const [studentsData, batches, courses] = await Promise.all([
      fetch(`${API_BASE_URL}/students`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/batches`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/courses`, { headers }).then(r => r.json()),
    ]);

    return {
      totalStudents: studentsData.pagination?.total || 0,
      totalBatches: batches.batches?.length || 0,
      totalCourses: courses.courses?.length || 0,
      recentStudents: studentsData.students?.slice(0, 5) || [],
      recentBatches: batches.batches?.slice(0, 4) || [],
    };
  } catch (error) {
    console.error('getDashboardStats network error:', error);
    return {
      totalStudents: 0,
      totalBatches: 0,
      totalCourses: 0,
      recentStudents: [],
      recentBatches: [],
    };
  }
}
