"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Search, Filter, Trash2, UserPlus, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastBanner } from "@/components/ui/ToastBanner";
import { enrollStudent, unenrollStudent, updateBatch } from "@/lib/actions/batch.actions";
import { useRouter } from "next/navigation";

export default function BatchDetailsClient({ 
  initialBatch, 
  initialEnrolledStudents,
  allStudents,
  teachers,
  courses
}: { 
  initialBatch: any, 
  initialEnrolledStudents: any[],
  allStudents: any[],
  teachers: any[],
  courses: any[]
}) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(""); // Search in enrolled
  const [modalSearch, setModalSearch] = useState(""); // Search in all students
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "error" | "success" | "info" | "warning" } | null>(null);

  const [batch, setBatch] = useState(initialBatch);
  const [students, setStudents] = useState(initialEnrolledStudents);

  // Confirmation dialog for student removal
  const [confirmState, setConfirmState] = useState<{ open: boolean; studentId: string | null; studentName: string }>({
    open: false,
    studentId: null,
    studentName: "",
  });

  const showToast = (message: string, variant: "error" | "success" | "info" | "warning" = "error") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 5000);
  };

  // Sync state with server data (after router.refresh)
  useEffect(() => {
    setBatch(initialBatch);
    setStudents(initialEnrolledStudents);
  }, [initialBatch, initialEnrolledStudents]);

  // --- OPTIMISTIC HANDLERS ---
  const handleEnrollStudent = async (student: any) => {
    // Check local capacity if defined
    if (batch.max_seats > 0 && students.length >= batch.max_seats) {
      showToast(`This batch is already full (Max: ${batch.max_seats} seats).`, "warning");
      return;
    }

    // Optimistic Update
    const previousStudents = [...students];
    const optimisticStudent = {
      ...student,
      enrolled_at: new Error().stack, // Just a temp placeholder
      isOptimistic: true
    };
    
    setStudents([...students, optimisticStudent]);
    setIsAddModalOpen(false);

    const result = await enrollStudent(batch.id, student.id);
    if (!result.success) {
      setStudents(previousStudents);
      showToast(result.error || "Failed to enroll student");
    } else {
      router.refresh();
    }
  };

  // Opens the custom confirm dialog instead of native confirm()
  const handleRemoveStudent = (studentId: string, studentName: string) => {
    setConfirmState({ open: true, studentId, studentName });
  };

  const handleConfirmRemoveStudent = async () => {
    const studentId = confirmState.studentId!;
    setConfirmState({ open: false, studentId: null, studentName: "" });

    // Optimistic Update
    const previousStudents = [...students];
    setStudents(students.filter(s => s.id !== studentId));

    const result = await unenrollStudent(batch.id, studentId);
    if (!result.success) {
      setStudents(previousStudents);
      showToast(result.error || "Failed to remove student");
    } else {
      router.refresh();
    }
  };

  const handleSaveBatch = async () => {
    setIsSaving(true);
    const result = await updateBatch(batch.id, {
      name: batch.name,
      teacher_id: batch.teacher_id,
      course_id: batch.course_id,
      max_seats: batch.max_seats
    });

    if (result.error) {
      showToast(result.error);
    } else {
      showToast("Batch details saved!", "success");
      router.refresh();
    }
    setIsSaving(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      (s.name || '').toLowerCase().includes(localSearch.toLowerCase())
    );
  }, [students, localSearch]);

  const availableStudents = useMemo(() => {
    return allStudents.filter(s => 
      !students.some(es => es.id === s.id) &&
      (s.name || '').toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [allStudents, students, modalSearch]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const inputClass = "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  const isFull = batch.max_seats > 0 && students.length >= batch.max_seats;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12 relative">
      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title="Remove Student"
        message={`Are you sure you want to remove "${confirmState.studentName}" from this batch?`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={handleConfirmRemoveStudent}
        onCancel={() => setConfirmState({ open: false, studentId: null, studentName: "" })}
      />

      {/* Toast Banner */}
      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={() => setToast(null)}
      />
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/batches"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Batches
          </Link>
          {batch.max_seats > 0 && (
            <Badge variant={isFull ? "error" : "info"} className="font-mono">
              Seats: {students.length} / {batch.max_seats} {isFull ? '(FULL)' : ''}
            </Badge>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 mb-1">Batch Management</h1>
          <p className="text-sm text-neutral-400">Manage batch details and enrolled students.</p>
        </div>
      </div>

      {/* 1. Batch Details Info */}
      <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-neutral-100">Batch Details</h2>
          <button 
            onClick={handleSaveBatch}
            disabled={isSaving}
            className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Batch Name</label>
            <input 
              type="text" 
              value={batch.name || ""} 
              onChange={(e) => setBatch({...batch, name: e.target.value})}
              className={`w-full ${inputClass}`} 
            />
          </div>
          <div>
            <label className={labelClass}>Assigned Teacher</label>
            <select 
              value={batch.teacher_id}
              onChange={(e) => setBatch({...batch, teacher_id: e.target.value})}
              className={`w-full ${inputClass}`}
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Linked Course</label>
            <select 
              value={batch.course_id}
              onChange={(e) => setBatch({...batch, course_id: e.target.value})}
              className={`w-full ${inputClass}`}
            >
              <option value="">No Course Linked</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Max Seats (Capacity)</label>
            <input 
              type="number" 
              min="0"
              value={batch.max_seats || 0} 
              onChange={(e) => setBatch({...batch, max_seats: parseInt(e.target.value) || 0})}
              className={`w-full ${inputClass}`} 
              placeholder="0 for unlimited"
            />
          </div>
        </div>
      </Card>

      {/* 2. Enrolled Students List */}
      <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#262626]">
          <h2 className="text-lg font-bold text-neutral-100 whitespace-nowrap">Enrolled Students ({students.length})</h2>
          
          <div className="flex w-full sm:w-auto flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search students..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className={`pl-9 w-full ${inputClass}`}
              />
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-sm text-neutral-200 hover:bg-neutral-800 transition-colors w-full sm:w-auto justify-center"
            >
              <UserPlus className="h-4 w-4" /> Add Student
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Contact Phone</th>
                <th className="px-6 py-4 font-medium">Fee Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    {localSearch ? "No matching students found." : "No students currently enrolled in this batch."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className={`hover:bg-neutral-800/30 transition-colors ${student.isOptimistic ? 'opacity-50 animate-pulse' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={getInitials(student.name)} className="h-8 w-8 text-xs bg-neutral-700" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-100 block capitalize">{student.name}</span>
                            {student.roll_number && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 font-mono">
                                {student.roll_number}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-500">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">{student.parent_phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {/* Logic for fee status would go here, fallback to badge */}
                      <Badge variant="info">Enrolled</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!student.isOptimistic && (
                        <button 
                          onClick={() => handleRemoveStudent(student.id, student.name)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-[#2b2b2b] border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#262626] shrink-0">
              <h2 className="text-lg font-bold text-neutral-100">Add Students to Batch</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-neutral-800 bg-[#1e1e1e] shrink-0">
               <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search students to add..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className={`pl-9 w-full ${inputClass}`}
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-2 min-h-[300px]">
              <p className="text-xs font-bold text-neutral-500 uppercase mb-3">Available Students</p>
              {availableStudents.length === 0 ? (
                <div className="py-10 text-center text-neutral-500 text-sm italic">
                  No available students found.
                </div>
              ) : (
                availableStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-[#1e1e1e] hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar initials={getInitials(student.name)} className="h-8 w-8 text-xs bg-neutral-800" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-200 text-sm capitalize">{student.name}</p>
                          {student.roll_number && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-500 font-mono">
                              {student.roll_number}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500">{student.class} • {student.parent_phone}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEnrollStudent(student)}
                      className="px-3 py-1.5 rounded bg-[#a4c2b5] text-neutral-900 text-xs font-bold hover:bg-[#8eb0a2] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-neutral-800 bg-[#262626] flex justify-end shrink-0">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
