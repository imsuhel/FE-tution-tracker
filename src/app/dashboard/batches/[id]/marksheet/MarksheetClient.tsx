"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileBarChart2,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ToastBanner } from "@/components/ui/ToastBanner";
import { createExam, saveExamResults, getExamById } from "@/lib/actions/exam.actions";
import { useRouter } from "next/navigation";

interface Paper {
  id?: string;
  name: string;
  max_marks: number | string;
  passing_marks: number | string;
}

interface Student {
  id: string;
  name: string;
  roll_number: string;
  enrollment_id: string;
}

interface ActiveExam {
  exam: any;
  papers: any[];
  students: Student[];
  results: any[];
}

// marks[studentId][paperId] = number | ""
type MarksMap = Record<string, Record<string, number | "">>;

export default function MarksheetClient({
  batch,
  students,
  initialExams,
}: {
  batch: any;
  students: Student[];
  initialExams: any[];
}) {
  const router = useRouter();

  // ── Exam list ────────────────────────────────────────────────
  const [exams, setExams] = useState<any[]>(initialExams);

  // ── "Create Exam" form state ─────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [papers, setPapers] = useState<Paper[]>([
    { name: "", max_marks: 100, passing_marks: 35 },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  // ── Active exam (marks grid) ─────────────────────────────────
  const [activeExam, setActiveExam] = useState<ActiveExam | null>(null);
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
  const [marks, setMarks] = useState<MarksMap>({});
  const [isSaving, setIsSaving] = useState(false);

  // ── Toast ─────────────────────────────────────────────────────
  const [toast, setToast] = useState<{
    message: string;
    variant: "error" | "success" | "warning" | "info";
  } | null>(null);

  const showToast = (
    message: string,
    variant: "error" | "success" | "warning" | "info" = "error"
  ) => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 5000);
  };

  const inputClass =
    "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  // ── Paper row handlers ────────────────────────────────────────
  const addPaperRow = () =>
    setPapers((p) => [...p, { name: "", max_marks: 100, passing_marks: 35 }]);

  const removePaperRow = (idx: number) =>
    setPapers((p) => p.filter((_, i) => i !== idx));

  const updatePaper = (idx: number, field: keyof Paper, value: string) =>
    setPapers((p) =>
      p.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );

  // ── Create exam ───────────────────────────────────────────────
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      showToast("Please enter an exam name.", "warning");
      return;
    }
    const validPapers = papers.filter((p) => p.name.trim());
    if (validPapers.length === 0) {
      showToast("Please add at least one paper with a name.", "warning");
      return;
    }

    setIsCreating(true);
    const result = await createExam({
      batch_id: batch.id,
      name: examName.trim(),
      exam_date: examDate || undefined,
      papers: validPapers.map((p) => ({
        name: p.name.trim(),
        max_marks: Number(p.max_marks) || 100,
        passing_marks: Number(p.passing_marks) || 35,
      })),
    });
    setIsCreating(false);

    if (result.error) {
      showToast(result.error);
      return;
    }

    showToast("Exam created successfully!", "success");
    setExams((prev) => [{ ...result.exam, paper_count: validPapers.length }, ...prev]);

    // Reset form and open the new exam
    setExamName("");
    setExamDate("");
    setPapers([{ name: "", max_marks: 100, passing_marks: 35 }]);
    setShowCreateForm(false);

    // Auto-open the newly created exam
    await openExam(result.exam.id);
  };

  // ── Open exam (load students + results) ───────────────────────
  const openExam = async (examId: string) => {
    if (activeExam?.exam.id === examId) {
      setActiveExam(null);
      return;
    }
    setLoadingExamId(examId);
    const data = await getExamById(examId);
    setLoadingExamId(null);

    if (!data) {
      showToast("Failed to load exam data.");
      return;
    }

    // Build marks map from existing results
    const marksMap: MarksMap = {};
    for (const student of data.students) {
      marksMap[student.id] = {};
      for (const paper of data.papers) {
        marksMap[student.id][paper.id] = "";
      }
    }
    for (const r of data.results) {
      if (marksMap[r.student_id]) {
        marksMap[r.student_id][r.paper_id] =
          r.marks_obtained !== null ? r.marks_obtained : "";
      }
    }

    setActiveExam(data);
    setMarks(marksMap);
  };

  // ── Mark input change ─────────────────────────────────────────
  const handleMarkChange = (
    studentId: string,
    paperId: string,
    value: string,
    maxMarks: number
  ) => {
    let num: number | "" = "";
    if (value !== "") {
      num = Math.min(Math.max(0, parseInt(value) || 0), maxMarks);
    }
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [paperId]: num },
    }));
  };

  // ── Save marks ────────────────────────────────────────────────
  const handleSaveMarks = async () => {
    if (!activeExam) return;
    setIsSaving(true);

    const results = [];
    for (const student of activeExam.students) {
      for (const paper of activeExam.papers) {
        const m = marks[student.id]?.[paper.id];
        results.push({
          paper_id: paper.id,
          student_id: student.id,
          enrollment_id: student.enrollment_id,
          marks_obtained: m === "" ? null : (m as number),
        });
      }
    }

    const res = await saveExamResults(activeExam.exam.id, results);
    setIsSaving(false);

    if (res.error) {
      showToast(res.error);
    } else {
      showToast("Marks saved successfully!", "success");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const calcTotal = (studentId: string, examPapers: any[]) => {
    const vals = examPapers.map((p) => marks[studentId]?.[p.id]);
    if (vals.every((v) => v === "" || v === undefined)) return null;
    return vals.reduce<number>((acc, v) => acc + (typeof v === "number" ? v : 0), 0);
  };

  const calcMaxTotal = (examPapers: any[]) =>
    examPapers.reduce((acc, p) => acc + p.max_marks, 0);

  const isPassed = (studentId: string, examPapers: any[]) => {
    return examPapers.every((p) => {
      const m = marks[studentId]?.[p.id];
      return typeof m === "number" && m >= p.passing_marks;
    });
  };

  return (
    <>
      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={() => setToast(null)}
      />

      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/batches"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Batches
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-100 mb-1 flex items-center gap-3">
                <span className="p-2 rounded-lg bg-purple-900/30 border border-purple-900/50 text-purple-400">
                  <FileBarChart2 className="h-5 w-5" />
                </span>
                Marksheet Generator
              </h1>
              <p className="text-sm text-neutral-400">
                Create exams, enter student marks, and generate marksheets.
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Exam
            </button>
          </div>
        </div>

        {/* ── Batch Info Card ── */}
        <Card className="p-5 border-neutral-700/50 bg-[#2b2b2b]">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 text-[#a4c2b5]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Batch</p>
                <p className="text-sm font-bold text-neutral-100">{batch.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Students</p>
                <p className="text-sm font-bold text-neutral-100">{students.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Course</p>
                <p className="text-sm font-bold text-neutral-100">{batch.course_name || "—"}</p>
              </div>
            </div>
            <Badge variant="info" className="bg-[#a4c2b5]/10 text-[#a4c2b5] border-[#a4c2b5]/20 ml-auto">
              {batch.teacher_name || "No teacher"}
            </Badge>
          </div>
        </Card>

        {/* ── Create Exam Form ── */}
        {showCreateForm && (
          <Card className="border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
            <div className="h-0.5 bg-purple-600" />
            <form onSubmit={handleCreateExam}>
              <div className="p-6 flex flex-col gap-6">
                <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-purple-400" />
                  Create New Exam
                </h2>

                {/* Exam name + date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Exam Name *</label>
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder="e.g. Half Yearly Exam 2025"
                      className={`w-full ${inputClass}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Exam Date (optional)</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className={`w-full ${inputClass} [color-scheme:dark]`}
                    />
                  </div>
                </div>

                {/* Papers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Exam Papers / Subjects
                    </label>
                    <button
                      type="button"
                      onClick={addPaperRow}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Paper
                    </button>
                  </div>

                  {/* Header row */}
                  <div className="hidden md:grid grid-cols-[1fr_120px_120px_40px] gap-3 mb-2 px-1">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Paper / Subject Name</span>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold text-center">Max Marks</span>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold text-center">Passing Marks</span>
                    <span />
                  </div>

                  <div className="flex flex-col gap-2">
                    {papers.map((paper, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_40px] gap-3 items-center p-3 rounded-lg bg-[#1e1e1e] border border-neutral-800"
                      >
                        <input
                          type="text"
                          placeholder={`e.g. Mathematics, MS Excel`}
                          value={paper.name}
                          onChange={(e) => updatePaper(idx, "name", e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          min={1}
                          placeholder="100"
                          value={paper.max_marks}
                          onChange={(e) => updatePaper(idx, "max_marks", e.target.value)}
                          className={`${inputClass} text-center`}
                        />
                        <input
                          type="number"
                          min={0}
                          placeholder="35"
                          value={paper.passing_marks}
                          onChange={(e) => updatePaper(idx, "passing_marks", e.target.value)}
                          className={`${inputClass} text-center`}
                        />
                        <button
                          type="button"
                          onClick={() => removePaperRow(idx)}
                          disabled={papers.length === 1}
                          className="flex items-center justify-center h-9 w-9 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-900/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-800 bg-[#262626] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isCreating ? "Creating..." : "Create Exam"}
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* ── Exam List + Marks Grid ── */}
        {exams.length === 0 && !showCreateForm ? (
          <Card className="border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="p-5 rounded-2xl bg-purple-900/10 border border-purple-900/30">
                <FileBarChart2 className="h-10 w-10 text-purple-400/60" />
              </div>
              <div>
                <p className="text-neutral-300 font-semibold mb-1">No exams yet</p>
                <p className="text-sm text-neutral-500">
                  Click <span className="text-purple-400 font-medium">"New Exam"</span> above to create your first exam for this batch.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
                {/* Exam accordion header */}
                <button
                  type="button"
                  onClick={() => openExam(exam.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-900/30 text-purple-400">
                      <FileBarChart2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-100">{exam.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {exam.paper_count} paper{exam.paper_count !== 1 ? "s" : ""}
                        {exam.exam_date
                          ? ` · ${new Date(exam.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {loadingExamId === exam.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    ) : activeExam?.exam.id === exam.id ? (
                      <ChevronDown className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>
                </button>

                {/* ── Marks Grid ── */}
                {activeExam?.exam.id === exam.id && (
                  <div className="border-t border-neutral-800">
                    {activeExam.students.length === 0 ? (
                      <div className="py-12 text-center text-neutral-500 text-sm">
                        No students enrolled in this batch yet.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-neutral-400 border-collapse">
                            <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/60 border-b border-neutral-800">
                              <tr>
                                <th className="px-4 py-3 font-medium text-left sticky left-0 bg-[#262626] z-10 w-16">
                                  Roll No
                                </th>
                                <th className="px-4 py-3 font-medium text-left sticky left-16 bg-[#262626] z-10 min-w-[160px]">
                                  Student Name
                                </th>
                                {activeExam.papers.map((p) => (
                                  <th
                                    key={p.id}
                                    className="px-3 py-3 font-medium text-center min-w-[130px]"
                                  >
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="text-neutral-300">{p.name}</span>
                                      <span className="text-[10px] text-neutral-600 normal-case">
                                        Max: {p.max_marks} · Pass: {p.passing_marks}
                                      </span>
                                    </div>
                                  </th>
                                ))}
                                <th className="px-4 py-3 font-medium text-center border-l border-neutral-800 min-w-[90px]">
                                  Total
                                </th>
                                <th className="px-4 py-3 font-medium text-center min-w-[80px]">
                                  Result
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                              {activeExam.students.map((student) => {
                                const total = calcTotal(student.id, activeExam.papers);
                                const maxTotal = calcMaxTotal(activeExam.papers);
                                const passed = total !== null && isPassed(student.id, activeExam.papers);

                                return (
                                  <tr
                                    key={student.id}
                                    className="hover:bg-neutral-800/20 transition-colors group"
                                  >
                                    <td className="px-4 py-3 sticky left-0 bg-[#2b2b2b] group-hover:bg-[#333] transition-colors z-10">
                                      <span className="font-mono text-xs text-neutral-500">
                                        {student.roll_number || "—"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 sticky left-16 bg-[#2b2b2b] group-hover:bg-[#333] transition-colors z-10">
                                      <span className="font-medium text-neutral-200 capitalize">
                                        {student.name}
                                      </span>
                                    </td>
                                    {activeExam.papers.map((paper) => (
                                      <td key={paper.id} className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min={0}
                                          max={paper.max_marks}
                                          value={marks[student.id]?.[paper.id] ?? ""}
                                          onChange={(e) =>
                                            handleMarkChange(
                                              student.id,
                                              paper.id,
                                              e.target.value,
                                              paper.max_marks
                                            )
                                          }
                                          placeholder="—"
                                          className={`w-20 text-center font-bold py-1.5 px-2 rounded-md border bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors text-sm ${
                                            marks[student.id]?.[paper.id] !== "" &&
                                            marks[student.id]?.[paper.id] !== undefined
                                              ? typeof marks[student.id][paper.id] === "number" &&
                                                (marks[student.id][paper.id] as number) <
                                                  paper.passing_marks
                                                ? "border-red-500/40 bg-red-950/20"
                                                : "border-purple-500/40"
                                              : "border-neutral-700"
                                          }`}
                                        />
                                      </td>
                                    ))}
                                    <td className="px-4 py-3 text-center border-l border-neutral-800">
                                      {total !== null ? (
                                        <div className="flex flex-col items-center">
                                          <span className={`text-sm font-bold ${
                                            (total / maxTotal) >= 0.8
                                              ? "text-green-400"
                                              : (total / maxTotal) >= 0.4
                                              ? "text-yellow-400"
                                              : "text-red-400"
                                          }`}>
                                            {total}/{maxTotal}
                                          </span>
                                          <span className="text-[10px] text-neutral-500">
                                            {Math.round((total / maxTotal) * 100)}%
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-neutral-600">—</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {total !== null ? (
                                        passed ? (
                                          <div className="inline-flex items-center gap-1 text-xs font-bold text-green-400">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            PASS
                                          </div>
                                        ) : (
                                          <div className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                                            <XCircle className="h-3.5 w-3.5" />
                                            FAIL
                                          </div>
                                        )
                                      ) : (
                                        <span className="text-neutral-600 text-xs">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Save button */}
                        <div className="p-4 border-t border-neutral-800 bg-[#262626] flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveMarks}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            {isSaving ? "Saving..." : "Save Marks"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
