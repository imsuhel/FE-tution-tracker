"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, Eye, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { createBatch } from "@/lib/actions/batch.actions";
import { useRouter } from "next/navigation";

export default function BatchesClient({ 
  initialBatches, 
  courses, 
  teachers 
}: { 
  initialBatches: any[], 
  courses: any[], 
  teachers: any[] 
}) {
  const router = useRouter();
  const [batches, setBatches] = useState(initialBatches);

  // Update local state when server data changes (after router.refresh)
  useEffect(() => {
    setBatches(initialBatches);
  }, [initialBatches]);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const safeJsonParse = (str: string, fallback: any = []) => {
    try {
      if (!str) return fallback;
      // If it's already an array (optimistic data)
      if (Array.isArray(str)) return str;
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  };

  const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Prepare optimistic batch
    const selectedCourse = courses.find(c => c.id === data.course_id);
    const selectedTeacher = teachers.find(t => t.id === data.teacher_id);
    
    const tempId = `temp-${Date.now()}`;
    const optimisticBatch = {
      id: tempId,
      name: data.name,
      course_name: selectedCourse?.name || '...',
      teacher_name: selectedTeacher?.name || '...',
      timing: data.timing || '',
      days: '[]',
      isOptimistic: true
    };

    const previousBatches = [...batches];
    setBatches([optimisticBatch, ...batches]);
    setIsCreateModalOpen(false);

    const result = await createBatch(data);
    
    if (result.error) {
      setError(result.error);
      setBatches(previousBatches);
      setIsCreateModalOpen(true);
      setIsSubmitting(false);
    } else {
      // Revalidate and get fresh data or just replace if result had data
      router.refresh();
      setIsSubmitting(false);
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter(b => 
      (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.course_name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [batches, search]);

  const inputClass = "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 mb-1">Batches</h1>
          <p className="text-sm text-neutral-400">Organize your students into course batches.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors whitespace-nowrap"
        >
          + Create Batch
        </button>
      </div>

      <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#262626]">
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 w-full ${inputClass}`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Batch Name</th>
                <th className="px-6 py-4 font-medium">Linked Course</th>
                <th className="px-6 py-4 font-medium">Capacity</th>
                <th className="px-6 py-4 font-medium">Teacher Assigned</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">No batches found.</td>
                </tr>
              ) : (
                filteredBatches.map((batch: any) => (
                  <tr key={batch.id} className={`hover:bg-neutral-800/30 transition-colors ${batch.isOptimistic ? 'opacity-50 animate-pulse' : ''}`}>
                    <td className="px-6 py-4 font-medium text-neutral-100">{batch.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="info" className="bg-[#a4c2b5]/10 text-[#a4c2b5] border-[#a4c2b5]/20">{batch.course_name}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-neutral-200 text-sm font-medium">
                          {batch.student_count || 0} / {batch.max_seats > 0 ? batch.max_seats : '∞'}
                        </span>
                        {batch.max_seats > 0 && (batch.student_count || 0) >= batch.max_seats && (
                          <span className="text-[10px] text-red-400 font-bold">FULL</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-neutral-200">{batch.teacher_name}</span>
                        <span className="text-xs text-neutral-500">{batch.timing || 'No timing'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!batch.isOptimistic && (
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/batches/${batch.id}/attendance`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#a4c2b5]/10 text-[#a4c2b5] border border-[#a4c2b5]/20 hover:bg-[#a4c2b5] hover:text-neutral-900 transition-all font-medium text-xs"
                          >
                            Mark Attendance
                          </Link>
                          <Link
                            href={`/dashboard/batches/${batch.id}`}
                            className="inline-flex items-center justify-center p-1.5 rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                            title="Manage Batch"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-[#2b2b2b] border-neutral-700 shadow-2xl overflow-hidden">
            <form onSubmit={handleCreateBatch}>
              <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#262626]">
                <h2 className="text-lg font-bold text-neutral-100">Create New Batch</h2>
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-400">{error}</div>}

                <div>
                  <label className={labelClass}>Batch Name *</label>
                  <input name="name" required type="text" className={`w-full ${inputClass}`} placeholder="e.g. Class 10 Science - Morning" />
                </div>
                <div>
                  <label className={labelClass}>Course *</label>
                  <select name="course_id" required className={`w-full ${inputClass}`}>
                    <option value="">Select a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Assign Teacher *</label>
                  <select name="teacher_id" required className={`w-full ${inputClass}`}>
                    <option value="">Select a teacher...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Timing</label>
                  <input name="timing" type="text" className={`w-full ${inputClass}`} placeholder="e.g. 6:00 PM - 7:30 PM" />
                </div>
                <div>
                  <label className={labelClass}>Max Seats (Capacity)</label>
                  <input name="max_seats" type="number" min="0" className={`w-full ${inputClass}`} placeholder="0 for unlimited" />
                </div>
              </div>
              
              <div className="p-4 border-t border-neutral-800 bg-[#262626] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create Batch
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
