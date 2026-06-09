"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Filter, MoreVertical, X, Loader2 } from "lucide-react";
import { createTeacher } from "@/lib/actions/teacher.actions";

export default function TeachersClient({ initialTeachers }: { initialTeachers: any[] }) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync state with server data (after router.refresh)
  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Optimistic teacher
    const optimisticTeacher = {
      id: `temp-${Date.now()}`,
      name: data.name,
      role: data.role,
      email: data.email,
      qualification: data.qualification,
      salary: Number(data.salary),
      isOptimistic: true
    };

    const previousTeachers = [...teachers];
    setTeachers([optimisticTeacher, ...teachers]);
    setIsAddModalOpen(false);

    const result = await createTeacher(data);
    if (result.error) {
      setError(result.error);
      setTeachers(previousTeachers);
      setIsAddModalOpen(true);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  const inputClass = "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 mb-1">Teachers</h1>
          <p className="text-sm text-neutral-400">Manage your faculty and their assignments.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors"
        >
          + Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher: any) => (
          <Card key={teacher.id} className={`p-6 border-neutral-700/50 bg-[#2b2b2b] hover:border-neutral-600 transition-colors ${teacher.isOptimistic ? 'opacity-50 animate-pulse' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <Avatar initials={teacher.name?.[0]} className="h-12 w-12 text-lg bg-neutral-700" />
              {!teacher.isOptimistic && (
                <button className="text-neutral-500 hover:text-neutral-300">
                  <MoreVertical className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-bold text-neutral-100">{teacher.name}</h3>
              <p className="text-sm text-neutral-400">{teacher.role}</p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Qualification</span>
                <span className="text-neutral-300">{teacher.qualification || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Email</span>
                <span className="text-neutral-300">{teacher.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Salary</span>
                <span className="text-[#4ade80]">₹{teacher.salary || 0}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="info" className="bg-[#a4c2b5]/10 text-[#a4c2b5] border-[#a4c2b5]/20">Active</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-[#2b2b2b] border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
            <form onSubmit={handleAddTeacher}>
              <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#262626]">
                <h2 className="text-lg font-bold text-neutral-100">Add New Teacher</h2>
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-400">{error}</div>}

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name *</label>
                  <input name="name" required type="text" className={`w-full ${inputClass}`} placeholder="e.g. Dr. Neha Joshi" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Email *</label>
                  <input name="email" required type="email" className={`w-full ${inputClass}`} placeholder="neha@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Role / Position *</label>
                  <input name="role" required type="text" className={`w-full ${inputClass}`} placeholder="e.g. Senior Faculty" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Qualification</label>
                  <input name="qualification" type="text" className={`w-full ${inputClass}`} placeholder="e.g. M.Sc Physics" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Monthly Salary</label>
                  <input name="salary" type="number" className={`w-full ${inputClass}`} placeholder="50000" />
                </div>
              </div>
              
              <div className="p-4 border-t border-neutral-800 bg-[#262626] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  Add Teacher
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
