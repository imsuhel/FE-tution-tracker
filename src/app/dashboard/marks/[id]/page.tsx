"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Save, FileBarChart, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ToastBanner } from "@/components/ui/ToastBanner";

export default function MarksEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "error" | "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, variant: "error" | "success" | "info" | "warning" = "error") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 5000);
  };

  // --- MOCK DATA ---
  const examInfo = {
    id: resolvedParams.id,
    name: "Half Yearly Exams",
    batch: "Class 10 Science",
    course: "Foundation Course - Class 10",
    date: "2026-05-15",
    subjects: [
      { id: "m1", name: "English", totalMarks: 100 },
      { id: "m2", name: "Physics", totalMarks: 100 },
      { id: "m3", name: "Maths", totalMarks: 100 },
    ]
  };

  const [students, setStudents] = useState([
    { id: "s1", name: "Aarav Rathore", init: "AR", marks: { m1: 80, m2: 60, m3: 90 } },
    { id: "s2", name: "Priya Sharma", init: "PS", marks: { m1: null, m2: null, m3: null } },
    { id: "s3", name: "Neha Verma", init: "NV", marks: { m1: 95, m2: 85, m3: 92 } },
    { id: "s4", name: "Rohan Kumar", init: "RK", marks: { m1: null, m2: null, m3: null } },
  ]);

  // --- HANDLERS ---
  const handleMarkChange = (studentId: string, subjectId: string, value: string, totalMarks: number) => {
    let numValue = parseInt(value);
    if (isNaN(numValue)) numValue = null as unknown as number;
    else if (numValue > totalMarks) numValue = totalMarks;
    else if (numValue < 0) numValue = 0;

    setStudents(students.map(s => {
      if (s.id === studentId) {
        return { ...s, marks: { ...s.marks, [subjectId]: numValue } };
      }
      return s;
    }));
  };

  const handleSaveMarks = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Marks saved successfully!", "success");
    }, 600);
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const inputClass = "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";

  // Helpers
  const calculateTotal = (marksObj: Record<string, number | null>) => {
    let obtained = 0;
    let total = 0;
    let hasAnyMarks = false;

    examInfo.subjects.forEach(sub => {
      if (marksObj[sub.id] !== null && marksObj[sub.id] !== undefined) {
        obtained += marksObj[sub.id] as number;
        total += sub.totalMarks;
        hasAnyMarks = true;
      }
    });

    if (!hasAnyMarks) return null;
    return { obtained, total, percentage: Math.round((obtained / total) * 100) };
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Toast Banner */}
      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={() => setToast(null)}
      />
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/marks"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exams
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">Marks Entry</h1>
            <p className="text-sm text-neutral-400">Feed student marks for all subjects in the exam.</p>
          </div>
          <button 
            onClick={handleSaveMarks}
            disabled={isSaving}
            className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-6 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Marks"}
          </button>
        </div>
      </div>

      {/* 1. Exam Details Card */}
      <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b] flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-neutral-800 rounded-lg text-[#a4c2b5]">
            <FileBarChart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-100">{examInfo.name}</h2>
            <p className="text-sm text-neutral-400 mt-1">{examInfo.batch} • {examInfo.course}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 md:gap-8">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Date</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-200">
              <CalendarIcon className="w-4 h-4 text-neutral-400" />
              {new Date(examInfo.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Subjects</span>
            <span className="text-sm font-medium text-neutral-200 bg-[#1e1e1e] px-3 py-1 rounded-full border border-neutral-700">
              {examInfo.subjects.length} Topics
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Grading Spreadsheet */}
      <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#262626]">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 w-full ${inputClass}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium sticky left-0 bg-[#262626] z-10 w-64 border-r border-neutral-800">Student Name</th>
                
                {/* Dynamically render subject columns */}
                {examInfo.subjects.map(subject => (
                  <th key={subject.id} className="px-6 py-4 font-medium text-center min-w-[140px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-neutral-300">{subject.name}</span>
                      <span className="text-[10px] text-neutral-500 lowercase">Out of {subject.totalMarks}</span>
                    </div>
                  </th>
                ))}
                
                <th className="px-6 py-4 font-medium text-center border-l border-neutral-800">Total %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={examInfo.subjects.length + 2} className="px-6 py-8 text-center text-neutral-500">
                    No students found in this batch.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const totals = calculateTotal(student.marks);
                  
                  return (
                    <tr key={student.id} className="hover:bg-neutral-800/30 transition-colors group">
                      <td className="px-6 py-4 sticky left-0 bg-[#2b2b2b] group-hover:bg-[#333333] transition-colors z-10 border-r border-neutral-800">
                        <div className="flex items-center gap-3">
                          <Avatar initials={student.init} className="h-8 w-8 text-xs bg-neutral-700" />
                          <span className="font-medium text-neutral-100">{student.name}</span>
                        </div>
                      </td>
                      
                      {/* Dynamically render subject input cells */}
                      {examInfo.subjects.map(subject => (
                        <td key={subject.id} className="px-4 py-3 text-center">
                          <input 
                            type="number"
                            min="0"
                            max={subject.totalMarks}
                            value={student.marks[subject.id as keyof typeof student.marks] ?? ""}
                            onChange={(e) => handleMarkChange(student.id, subject.id, e.target.value, subject.totalMarks)}
                            className={`w-20 text-center font-bold py-1.5 px-2 rounded-md border bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors ${
                              student.marks[subject.id as keyof typeof student.marks] !== null 
                                ? 'border-[#a4c2b5]/50' 
                                : 'border-neutral-700'
                            }`}
                            placeholder="-"
                          />
                        </td>
                      ))}

                      <td className="px-6 py-4 border-l border-neutral-800 text-center">
                        {totals !== null ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-bold ${totals.percentage >= 80 ? 'text-green-400' : totals.percentage >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {totals.percentage}%
                            </span>
                            <span className="text-[10px] text-neutral-500">{totals.obtained} / {totals.total}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
