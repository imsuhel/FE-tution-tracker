"use server";

import { getServerHeaders } from './dashboard.actions';
import { API_BASE_URL } from '../constants';
import { revalidatePath } from 'next/cache';

export interface ExamPaperInput {
  name: string;
  max_marks: number;
  passing_marks: number;
}

export interface ExamResultInput {
  paper_id: string;
  student_id: string;
  enrollment_id: string;
  marks_obtained: number | null;
}

// ── Create exam with papers ──────────────────────────────────
export async function createExam(data: {
  batch_id: string;
  name: string;
  exam_date?: string;
  papers: ExamPaperInput[];
}) {
  try {
    const headers = await getServerHeaders();
    const res = await fetch(`${API_BASE_URL}/exams`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { error: result.error || 'Failed to create exam' };
    revalidatePath(`/dashboard/batches/${data.batch_id}/marksheet`);
    return { success: true, exam: result.exam, papers: result.papers };
  } catch {
    return { error: 'Internal server error' };
  }
}

// ── List exams for a batch ───────────────────────────────────
export async function getExamsByBatch(batchId: string) {
  try {
    const headers = await getServerHeaders();
    const res = await fetch(`${API_BASE_URL}/exams?batch_id=${batchId}`, {
      headers,
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.exams || [];
  } catch {
    return [];
  }
}

// ── Get single exam with students + results ──────────────────
export async function getExamById(examId: string) {
  try {
    const headers = await getServerHeaders();
    const res = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      headers,
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.json(); // { exam, papers, students, results }
  } catch {
    return null;
  }
}

// ── Save (upsert) exam results ───────────────────────────────
export async function saveExamResults(examId: string, results: ExamResultInput[]) {
  try {
    const headers = await getServerHeaders();
    const res = await fetch(`${API_BASE_URL}/exams/${examId}/results`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ results }),
    });
    const result = await res.json();
    if (!res.ok) return { error: result.error || 'Failed to save results' };
    return { success: true };
  } catch {
    return { error: 'Internal server error' };
  }
}
