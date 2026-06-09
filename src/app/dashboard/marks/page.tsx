"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, FileBarChart, Calendar as CalendarIcon, CheckSquare, Eye, X } from "lucide-react";

export default function MarksPage() {
  const [search, setSearch] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // --- MOCK DATA ---
  const mockExams = [
    { id: "exam-1", name: "Half Yearly Exams", batch: "Class 10 Science", date: "2026-05-15", status: "upcoming", subjectsCount: 3 },
    { id: "exam-2", name: "Unit Test 1", batch: "Class 11 Physics", date: "2026-04-20", status: "graded", subjectsCount: 1 },
    { id: "exam-3", name: "Mid Terms", batch: "Class 9 Maths", date: "2026-05-08", status: "pending_grades", subjectsCount: 2 },
  ];

  const filteredExams = mockExams.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.batch.toLowerCase().includes(search.toLowerCase()));

  const inputClass = "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming': return <Badge variant="info">Upcoming</Badge>;
      case 'graded': return <Badge variant="success">Graded</Badge>;
      case 'pending_grades': return <Badge variant="warning">Pending</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 mb-1">Exams & Marks</h1>
          <p className="text-sm text-neutral-400">Manage offline exams and record student marks across subjects.</p>
        </div>
        <button 
          onClick={() => setIsScheduleModalOpen(true)}
          className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors whitespace-nowrap"
        >
          + Add Exam
        </button>
      </div>

      <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#262626]">
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 w-full ${inputClass}`}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-400" />
              <select className={`${inputClass} py-1.5 appearance-none pr-8 cursor-pointer`}>
                <option value="all">All Batches</option>
                <option value="b1">Class 10 Science</option>
                <option value="b2">Class 11 Physics</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select className={`${inputClass} py-1.5 appearance-none pr-8 cursor-pointer`}>
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="pending_grades">Pending</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Exam Name</th>
                <th className="px-6 py-4 font-medium">Batch</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Subjects Tested</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-800 rounded text-neutral-400">
                        <FileBarChart className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-neutral-100">{exam.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-200">
                    {exam.batch}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-1.5 text-neutral-200">
                    <CalendarIcon className="h-3.5 w-3.5 text-neutral-500" />
                    {new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-neutral-200">
                    {exam.subjectsCount} Subjects
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(exam.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/marks/${exam.id}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                      {exam.status === 'upcoming' ? <Eye className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />} 
                      {exam.status === 'upcoming' ? 'View Details' : 'Enter Marks'}
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredExams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No exams found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Exam Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-[#2b2b2b] border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#262626] shrink-0">
              <h2 className="text-lg font-bold text-neutral-100">Add New Exam</h2>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className={labelClass}>Exam Name *</label>
                <input type="text" className={`w-full ${inputClass}`} placeholder="e.g. Half Yearly Exams" />
              </div>

              <div>
                <label className={labelClass}>Select Batch *</label>
                <select className={`w-full ${inputClass}`}>
                  <option value="">Choose a batch...</option>
                  <option value="b1">Class 10 Science</option>
                  <option value="b2">Class 11 Physics</option>
                  <option value="b3">Class 9 Maths</option>
                </select>
                <p className="text-[10px] text-neutral-500 mt-1">Subjects to be graded are determined by the batch's linked course.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Exam Date</label>
                  <input type="date" className={`w-full ${inputClass} [color-scheme:dark]`} />
                </div>
                <div>
                  <label className={labelClass}>Default Total Marks (Per Subject)</label>
                  <input type="number" className={`w-full ${inputClass}`} defaultValue="100" />
                  <p className="text-[10px] text-neutral-500 mt-1">You can change this per subject during data entry.</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-neutral-800 bg-[#262626] flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors"
              >
                Save Exam
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
