"use server";

import { getServerHeaders } from "./dashboard.actions";
import { API_BASE_URL } from "../constants";
import { revalidatePath } from "next/cache";

export async function getCenterProfile() {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/center/profile`, {
      headers,
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('getCenterProfile failed:', error);
    return null;
  }
}

export async function updateCenterProfile(data: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/center/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to update profile' };

    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    console.error('updateCenterProfile failed:', error);
    return { error: 'Internal server error' };
  }
}
