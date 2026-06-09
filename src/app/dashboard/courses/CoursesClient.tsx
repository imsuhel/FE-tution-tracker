"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, BookOpen, Clock, X, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { createCourse } from "@/lib/actions/course.actions";

export default function CoursesClient({ initialCourses }: { initialCourses: any[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync state with server data (after router.refresh)
  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Optimistic course
    const optimisticCourse = {
      id: `temp-${Date.now()}`,
      name: data.name,
      type: data.type,
      duration: data.duration,
      monthly_fee: Number(data.monthly_fee),
      isOptimistic: true
    };

    const previousCourses = [...courses];
    setCourses([optimisticCourse, ...courses]);
    setIsCreateModalOpen(false);

    const result = await createCourse(data);
    if (result.error) {
      setError(result.error);
      setCourses(previousCourses);
      setIsCreateModalOpen(true);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  const inputClass = "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  const filteredCourses = initialCourses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 mb-1">Courses</h1>
          <p className="text-sm text-neutral-400">Manage courses and their curriculum modules.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors whitespace-nowrap"
        >
          + Create Course
        </button>
      </div>

      <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#262626]">
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search courses..."
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
                <th className="px-6 py-4 font-medium">Course Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Monthly Fee</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((course: any) => (
                <tr key={course.id} className={`hover:bg-neutral-800/30 transition-colors ${course.isOptimistic ? 'opacity-50 animate-pulse' : ''}`}>
                  <td className="px-6 py-4 font-medium text-neutral-100 flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-neutral-500" />
                    {course.name}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={course.type === 'Yearly' ? 'success' : 'warning'}>{course.type}</Badge>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-1.5 text-neutral-200">
                    <Clock className="h-3.5 w-3.5 text-neutral-500" />
                    {course.duration}
                  </td>
                  <td className="px-6 py-4 text-neutral-200">
                    ₹{(course.monthly_fee || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!course.isOptimistic && (
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Manage
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-[#2b2b2b] border-neutral-700 shadow-2xl overflow-hidden">
            <form onSubmit={handleCreateCourse}>
              <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#262626]">
                <h2 className="text-lg font-bold text-neutral-100">Create New Course</h2>
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
                  <label className={labelClass}>Course Name *</label>
                  <input name="name" required type="text" className={`w-full ${inputClass}`} placeholder="e.g. Advanced Physics - Class 12" />
                </div>
                <div>
                  <label className={labelClass}>Course Type</label>
                  <select name="type" className={`w-full ${inputClass}`}>
                    <option value="Yearly">Yearly Program</option>
                    <option value="Short Term">Short Term / Crash Course</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Duration</label>
                    <input name="duration" type="text" className={`w-full ${inputClass}`} placeholder="e.g. 10 Months" />
                  </div>
                  <div>
                    <label className={labelClass}>Monthly Fee (₹) *</label>
                    <input name="monthly_fee" required type="number" className={`w-full ${inputClass}`} placeholder="e.g. 1500" />
                  </div>
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
                  Create Course
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
