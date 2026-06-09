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

export async function getFees(params: { search?: string; status?: string }) {
  try {
    const headers = await getServerHeaders();
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/fees?${query.toString()}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`getFees failed: ${response.status} ${response.statusText}`);
      return { fees: [], metrics: { totalPending: 0, collectedThisMonth: 0, overdue: 0 } };
    }
    const data = await response.json();
    return data; // Should include { fees: [], metrics: {} }
  } catch (error) {
    console.error('getFees network error:', error);
    return { fees: [], metrics: { totalPending: 0, collectedThisMonth: 0, overdue: 0 } };
  }
}

export async function recordPayment(feeId: string, paymentData: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/fees/${feeId}/pay`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to record payment' };

    revalidatePath('/dashboard/fees');
    return { success: true };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}

export async function createFee(data: any) {
  try {
    const headers = await getServerHeaders();
    const response = await fetch(`${API_BASE_URL}/fees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) return { error: result.error || 'Failed to create fee' };

    revalidatePath('/dashboard/fees');
    revalidatePath(`/dashboard/students`); // to cover dynamic routes
    return { success: true, fee: result.fee };
  } catch (error) {
    return { error: 'Internal server error' };
  }
}
