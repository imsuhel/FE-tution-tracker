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

export async function getCourses() {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`getCourses failed: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error('getCourses network error:', error);
    return [];
  }
}

export async function createCourse(formData: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to create course' };

    revalidatePath('/dashboard/courses');
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function getCourseById(id: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`getCourseById failed: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('getCourseById network error:', error);
    return null;
  }
}

export async function updateCourse(id: string, data: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to update course' };

    revalidatePath(`/dashboard/courses/${id}`);
    revalidatePath('/dashboard/courses');
    return { success: true, data: result };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function addCourseModule(courseId: string, moduleName: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: moduleName }),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to add module' };

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true, module: result.module };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function addCourseModulesBulk(courseId: string, moduleNames: string[]) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ modules: moduleNames }),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to add modules' };

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true, modules: result.modules };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function updateCourseModule(courseId: string, moduleId: string, moduleName: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name: moduleName }),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to update module' };

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true, module: result.module };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function deleteCourseModule(courseId: string, moduleId: string) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const result = await response.json();
      return { error: result.error || 'Failed to delete module' };
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}
