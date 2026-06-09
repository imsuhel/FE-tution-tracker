"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const DEFAULT_SUBJECTS = [
  "Maths",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
];
const DEFAULT_GRADES = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [center, setCenter] = useState({
    name: "",
    owner_name: "",
    phone: "",
    city: "",
    address: "",
  });

  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");

  const [grades, setGrades] = useState<string[]>([]);
  const [gradeInput, setGradeInput] = useState("");

  function updateCenter(field: string, value: string) {
    setCenter((prev) => ({ ...prev, [field]: value }));
  }

  function addSubject(val?: string) {
    const v = (val ?? subjectInput).trim();
    if (!v || subjects.includes(v)) return;
    setSubjects((prev) => [...prev, v]);
    setSubjectInput("");
  }

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s));
  }

  function addGrade(val?: string) {
    const v = (val ?? gradeInput).trim();
    if (!v || grades.includes(v)) return;
    setGrades((prev) => [...prev, v]);
    setGradeInput("");
  }

  function removeGrade(g: string) {
    setGrades((prev) => prev.filter((x) => x !== g));
  }

  function validateStep1() {
    if (!center.name.trim()) return "Center name is required";
    if (!center.owner_name.trim()) return "Your name is required";
    if (!center.phone.trim()) return "Phone number is required";
    if (!center.city.trim()) return "City is required";
    return "";
  }

  function validateStep2() {
    if (subjects.length === 0) return "Add at least one subject";
    if (grades.length === 0) return "Add at least one class / grade";
    return "";
  }

  function handleStep1Continue() {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleFinish() {
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not logged in. Please sign in again.");
      setLoading(false);
      return;
    }

    const { error: centerErr } = await supabase.from("centers").insert({
      name: center.name,
      owner_name: center.owner_name,
      phone: center.phone,
      city: center.city,
      subjects,
      grades,
    });

    if (centerErr) {
      setError("Failed to save. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  const inputClass =
    "w-full text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] focus:border-transparent transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4 py-12 font-sans">
      <div className="w-full max-w-sm bg-[#2b2b2b] border border-neutral-800 rounded-2xl p-8 shadow-xl">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#a4c2b5] flex items-center justify-center text-sm text-neutral-900">
            🏫
          </div>
          <span className="font-bold text-neutral-100 text-sm">
            Tuition Tracker
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background:
                  n < step ? "#8eb0a2" : n === step ? "#a4c2b5" : "#3f3f3f",
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              Step 1 of 2
            </p>
            <h1 className="text-xl font-medium text-neutral-100 mb-1">
              Your center details
            </h1>
            <p className="text-sm text-neutral-400 mb-5">
              This info appears on parent reports
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Center name *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Bright Minds Classes"
                  value={center.name}
                  onChange={(e) => updateCenter("name", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Your name *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Owner / director name"
                  value={center.owner_name}
                  onChange={(e) => updateCenter("owner_name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input
                    type="tel"
                    className={inputClass}
                    placeholder="+91 98765 43210"
                    value={center.phone}
                    onChange={(e) => updateCenter("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Jalandhar"
                    value={center.city}
                    onChange={(e) => updateCenter("city", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea
                  className={inputClass}
                  placeholder="Full address of your center"
                  rows={2}
                  style={{ resize: "none" }}
                  value={center.address}
                  onChange={(e) => updateCenter("address", e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleStep1Continue}
              className="w-full mt-5 bg-[#a4c2b5] hover:bg-[#8eb0a2] text-neutral-900 rounded-lg py-2.5 text-sm font-bold transition-colors"
            >
              Continue →
            </button>

            <div className="mt-4 flex items-start gap-2 bg-[#a4c2b5]/10 rounded-lg px-3 py-2.5">
              <span className="text-[#a4c2b5] text-sm">🔒</span>
              <span className="text-xs text-[#a4c2b5]">
                Your data is private and only visible to your center staff
              </span>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              Step 2 of 2
            </p>
            <h1 className="text-xl font-medium text-neutral-100 mb-1">
              Subjects & grades
            </h1>
            <p className="text-sm text-neutral-400 mb-5">
              These will be available when creating batches
            </p>

            {/* Subjects */}
            <div className="mb-5">
              <label className={labelClass}>Subjects *</label>

              {/* Quick-add suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DEFAULT_SUBJECTS.filter((s) => !subjects.includes(s)).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => addSubject(s)}
                      className="text-xs px-2.5 py-1 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                    >
                      + {s}
                    </button>
                  ),
                )}
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Type a custom subject..."
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubject()}
                />
                <button
                  onClick={() => addSubject()}
                  className="px-3 py-2 rounded-lg border border-neutral-700 text-sm text-neutral-300 hover:bg-neutral-800 flex-shrink-0 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Added subjects */}
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {subjects.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700"
                    >
                      {s}
                      <button
                        onClick={() => removeSubject(s)}
                        className="text-neutral-500 hover:text-neutral-300 ml-0.5 leading-none transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Grades */}
            <div className="mb-6">
              <label className={labelClass}>Classes / grades *</label>

              {/* Quick-add suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DEFAULT_GRADES.filter((g) => !grades.includes(g)).map((g) => (
                  <button
                    key={g}
                    onClick={() => addGrade(g)}
                    className="text-xs px-2.5 py-1 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                  >
                    + {g}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Type a custom grade..."
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGrade()}
                />
                <button
                  onClick={() => addGrade()}
                  className="px-3 py-2 rounded-lg border border-neutral-700 text-sm text-neutral-300 hover:bg-neutral-800 flex-shrink-0 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Added grades */}
              {grades.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {grades.map((g) => (
                    <span
                      key={g}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700"
                    >
                      {g}
                      <button
                        onClick={() => removeGrade(g)}
                        className="text-neutral-500 hover:text-neutral-300 ml-0.5 leading-none transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-[#a4c2b5] hover:bg-[#8eb0a2] disabled:opacity-60 text-neutral-900 rounded-lg py-2.5 text-sm font-bold transition-colors"
            >
              {loading ? "Setting up your center..." : "Finish setup →"}
            </button>
            <button
              onClick={() => {
                setError("");
                setStep(1);
              }}
              className="w-full mt-2 border border-neutral-700 rounded-lg py-2.5 text-sm text-neutral-400 hover:bg-neutral-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
