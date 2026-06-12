"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createStudent } from "@/lib/actions/student.actions";

export default function StudentsClient({
  initialData,
  batches,
}: {
  initialData: any;
  batches: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [students, setStudents] = useState(initialData.students);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { pagination } = initialData;

  // Sync state with server data (after router.refresh)
  useEffect(() => {
    setStudents(initialData.students);
  }, [initialData.students]);

  // URL state management
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    startTransition(() => {
      router.push(`/dashboard/students?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateQuery("search", formData.get("search") as string);
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());

    const batchIds = formData.getAll("batch_ids");
    if (batchIds.length > 0) {
      data.batch_ids = batchIds;
      delete data.batch_id; // Just to keep it clean if we had it
    }

    // Optimistic student
    const optimisticStudent = {
      id: `temp-${Date.now()}`,
      name: data.name,
      email: data.email,
      class: data.class,
      roll_number: "...",
      parent_name: data.parent_name,
      parent_phone: data.parent_phone,
      pending_amount: 0,
      total_amount: 0,
      paid_amount: 0,
      isOptimistic: true,
    };

    const previousStudents = [...students];
    setStudents([optimisticStudent, ...students]);
    setIsAddModalOpen(false);

    const result = await createStudent(data);
    if (result.error) {
      setError(result.error);
      setStudents(previousStudents);
      setIsAddModalOpen(true);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 mb-1">Students</h1>
          <p className="text-sm text-neutral-400">
            Manage all registered students across your batches.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors whitespace-nowrap"
        >
          + Add Student
        </button>
      </div>

      {/* Controls Card */}
      <Card className="p-4 border-neutral-700/50 bg-[#2b2b2b] flex flex-col md:flex-row gap-4 items-center justify-between">
        <form
          onSubmit={handleSearch}
          className="relative w-full md:w-64 shrink-0"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            name="search"
            type="text"
            placeholder="Search students..."
            defaultValue={searchParams.get("search") || ""}
            className={`pl-9 w-full ${inputClass}`}
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              className={`${inputClass} py-1.5 appearance-none pr-8 cursor-pointer`}
              value={searchParams.get("class") || "all"}
              onChange={(e) => updateQuery("class", e.target.value)}
            >
              <option value="all">All Classes</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              className={`${inputClass} py-1.5 appearance-none pr-8 cursor-pointer`}
              value={searchParams.get("fee_status") || "all"}
              onChange={(e) => updateQuery("fee_status", e.target.value)}
            >
              <option value="all">Fee Status: All</option>
              <option value="pending">Pending Fees</option>
              <option value="cleared">Cleared</option>
            </select>
          </div>

          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-[#a4c2b5]" />
          )}
        </div>
      </Card>

      {/* Grid of Student Cards */}
      {students.length === 0 ? (
        <Card className="p-20 text-center text-neutral-500 border-neutral-700/50 bg-[#2b2b2b]">
          No students found matching your criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student: any) => (
            <Card
              key={student.id}
              className={`p-5 border-neutral-700/50 bg-[#2b2b2b] hover:border-neutral-600 transition-all flex flex-col group ${student.isOptimistic ? "opacity-50 animate-pulse" : ""}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={student.name?.[0] || "S"}
                    className="h-11 w-11 text-base bg-neutral-700 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-100 capitalize">
                        {student.name}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-500 truncate max-w-[140px]">
                      {student.email}
                    </p>
                  </div>
                </div>
                {!student.isOptimistic && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="p-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-800/50 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        Class
                      </span>
                      <span className="text-sm text-neutral-200">
                        {student.class || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-800/50 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        Enrollment ID
                      </span>
                      <span className="text-sm text-neutral-200 font-mono">
                        {student.roll_number || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-800/50 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        Parent / Phone
                      </span>
                      <span className="text-sm text-neutral-200">
                        {student.parent_name || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-800/50 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        Parent / Phone
                      </span>
                      <span className="text-xs text-neutral-200">
                        {student.parent_phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-800/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                      Batch
                    </span>
                    <span className="text-sm text-neutral-200">
                      {student.batch_name}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <Card className="p-4 border-neutral-700/50 bg-[#2b2b2b] flex items-center justify-between">
          <span className="text-sm text-neutral-400">
            Page{" "}
            <span className="font-medium text-neutral-200">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-200">
              {pagination.totalPages}
            </span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateQuery("page", (pagination.page - 1).toString())
              }
              disabled={pagination.page <= 1 || isPending}
              className="flex items-center justify-center h-9 px-4 rounded-lg text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </button>

            <button
              onClick={() =>
                updateQuery("page", (pagination.page + 1).toString())
              }
              disabled={pagination.page >= pagination.totalPages || isPending}
              className="flex items-center justify-center h-9 px-4 rounded-lg text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </Card>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl bg-[#2b2b2b] border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <form onSubmit={handleAddStudent} className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#262626] shrink-0">
                <h2 className="text-lg font-bold text-neutral-100">
                  Add New Student
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-6">
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-400">
                    {error}
                  </div>
                )}

                {/* Student Details */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">
                    Student Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        name="name"
                        required
                        type="text"
                        className={`w-full ${inputClass}`}
                        placeholder="e.g. Aarav Rathore"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Email *
                      </label>
                      <input
                        name="email"
                        required
                        type="email"
                        className={`w-full ${inputClass}`}
                        placeholder="student@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Date of Birth
                      </label>
                      <input
                        name="dob"
                        type="date"
                        className={`w-full ${inputClass} [color-scheme:dark]`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Class / Grade *
                      </label>
                      <input
                        name="class"
                        required
                        type="text"
                        className={`w-full ${inputClass}`}
                        placeholder="e.g. Grade 10"
                      />
                    </div>
                  </div>
                </div>

                {/* Parent Details */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">
                    Parent / Guardian
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Parent Name
                      </label>
                      <input
                        name="parent_name"
                        type="text"
                        className={`w-full ${inputClass}`}
                        placeholder="e.g. Rajesh Rathore"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Contact Number
                      </label>
                      <input
                        name="parent_phone"
                        type="tel"
                        className={`w-full ${inputClass}`}
                        placeholder="+91"
                      />
                    </div>
                  </div>
                </div>

                {/* Enrollment Details */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">
                    Enrollment
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Assign to Batches
                    </label>
                    <select
                      name="batch_ids"
                      multiple
                      className={`w-full ${inputClass} min-h-[100px]`}
                    >
                      {batches.map((batch) => (
                        <option
                          key={batch.id}
                          value={batch.id}
                          className="py-1"
                        >
                          {batch.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Hold Cmd/Ctrl to select multiple
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-800 bg-[#262626] flex justify-end gap-3 shrink-0">
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
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Add Student
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
