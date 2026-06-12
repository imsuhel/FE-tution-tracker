"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Trash2,
  BookOpen,
  Save,
  ListPlus,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastBanner } from "@/components/ui/ToastBanner";
import {
  updateCourse,
  addCourseModule,
  addCourseModulesBulk,
  updateCourseModule,
  deleteCourseModule,
} from "@/lib/actions/course.actions";
import { useRouter } from "next/navigation";

interface ConfirmState {
  open: boolean;
  moduleId: string | null;
  moduleName: string;
}

export default function CourseDetailsClient({
  initialCourse,
  initialModules,
}: {
  initialCourse: any;
  initialModules: any[];
}) {
  const router = useRouter();
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState(initialModules);
  const [newModuleName, setNewModuleName] = useState("");
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [bulkModuleText, setBulkModuleText] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleName, setEditingModuleName] = useState("");

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    moduleId: null,
    moduleName: "",
  });

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // --- HANDLERS ---
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || isAddingModule) return;

    const moduleNameToAdd = newModuleName;
    setNewModuleName("");
    setIsAddingModule(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticModule = {
      id: tempId,
      name: moduleNameToAdd,
      order_index: modules.length + 1,
      isOptimistic: true,
    };
    const previousModules = [...modules];
    setModules([...modules, optimisticModule]);

    const result = await addCourseModule(course.id, moduleNameToAdd);
    setIsAddingModule(false);

    if (result.success) {
      setModules((prev) =>
        prev.map((m) => (m.id === tempId ? result.module : m)),
      );
    } else {
      setModules(previousModules);
      setNewModuleName(moduleNameToAdd);
      showError(result.error || "Failed to add module");
    }
  };

  const handleAddModulesBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkModuleText.trim() || isAddingModule) return;

    const moduleNames = bulkModuleText
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (moduleNames.length === 0) return;

    setIsAddingModule(true);

    const tempIdPrefix = `temp-${Date.now()}-`;
    const optimisticModules = moduleNames.map((name, index) => ({
      id: `${tempIdPrefix}${index}`,
      name,
      order_index: modules.length + index + 1,
      isOptimistic: true,
    }));
    const previousModules = [...modules];
    setModules([...modules, ...optimisticModules]);
    setBulkModuleText("");

    const result = await addCourseModulesBulk(course.id, moduleNames);
    setIsAddingModule(false);

    if (result.success && result.modules) {
      setModules((prev) => {
        const base = prev.filter((m) => !m.id.startsWith(tempIdPrefix));
        return [...base, ...result.modules];
      });
    } else {
      setModules(previousModules);
      setBulkModuleText(moduleNames.join("\n"));
      showError(result.error || "Failed to add modules");
    }
  };

  // Opens the custom confirm dialog instead of native confirm()
  const handleRemoveModule = (moduleId: string, moduleName: string) => {
    setConfirmState({ open: true, moduleId, moduleName });
  };

  // Called when user clicks "Delete" in the custom dialog
  const handleConfirmDelete = async () => {
    const moduleId = confirmState.moduleId!;
    setConfirmState({ open: false, moduleId: null, moduleName: "" });

    const previousModules = [...modules];
    setModules(modules.filter((m) => m.id !== moduleId));

    const result = await deleteCourseModule(course.id, moduleId);
    if (!result.success) {
      setModules(previousModules);
      showError(result.error || "Failed to delete module");
    }
  };

  const handleSaveModuleEdit = async (moduleId: string) => {
    if (!editingModuleName.trim()) return;

    const previousModules = [...modules];
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, name: editingModuleName.trim() } : m,
      ),
    );
    setEditingModuleId(null);

    const result = await updateCourseModule(
      course.id,
      moduleId,
      editingModuleName.trim(),
    );
    if (!result.success) {
      setModules(previousModules);
      showError(result.error || "Failed to update module");
    }
  };

  const handleSaveCourse = async () => {
    setIsSavingCourse(true);
    const previousCourse = { ...course };

    const result = await updateCourse(course.id, {
      name: course.name,
      type: course.type,
      duration: course.duration,
      monthly_fee: course.monthly_fee,
    });
    setIsSavingCourse(false);

    if (result.success) {
      router.refresh();
    } else {
      setCourse(previousCourse);
      showError(result.error || "Failed to save course");
    }
  };

  const inputClass =
    "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  return (
    <>
      {/* ── Custom Confirmation Dialog ── */}
      <ConfirmDialog
        open={confirmState.open}
        title="Remove Module"
        message={`Are you sure you want to remove "${confirmState.moduleName}"? This action cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmState({ open: false, moduleId: null, moduleName: "" })
        }
      />

      {/* ── Toast Banner ── */}
      <ToastBanner message={errorMessage} onClose={() => setErrorMessage(null)} />

      <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">
              Course Management
            </h1>
            <p className="text-sm text-neutral-400">
              Manage course details and curriculum modules.
            </p>
          </div>
        </div>

        {/* 1. Course Details Form */}
        <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#a4c2b5]" />
              Course Settings
            </h2>
            <button
              onClick={handleSaveCourse}
              disabled={isSavingCourse}
              className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors disabled:opacity-50"
            >
              {isSavingCourse ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Course Name</label>
              <input
                type="text"
                value={course.name || ""}
                onChange={(e) => setCourse({ ...course, name: e.target.value })}
                className={`w-full ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass}>Course Type</label>
              <select
                value={course.type || "subject"}
                onChange={(e) => setCourse({ ...course, type: e.target.value })}
                className={`w-full ${inputClass}`}
              >
                <option value="subject">Subject Wise</option>
                <option value="test_series">Test Series</option>
                <option value="skill">Skill Based</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Duration</label>
                <input
                  type="text"
                  value={course.duration || ""}
                  onChange={(e) =>
                    setCourse({ ...course, duration: e.target.value })
                  }
                  className={`w-full ${inputClass}`}
                />
              </div>
              <div>
                <label className={labelClass}>Monthly Fee (₹)</label>
                <input
                  type="number"
                  value={course.monthly_fee || 0}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      monthly_fee: parseInt(e.target.value) || 0,
                    })
                  }
                  className={`w-full ${inputClass}`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Course Modules */}
        <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
          <div className="p-4 border-b border-neutral-800 bg-[#262626] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-neutral-100">
                Curriculum Modules
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Define the topics covered in this course in order.
              </p>
            </div>
            <button
              className="flex items-center gap-2 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-medium hover:text-neutral-200 transition-colors"
              onClick={() => router.refresh()}
            >
              <Save className="h-3.5 w-3.5" /> Sync Status
            </button>
          </div>

          {/* Add Module Tabs Toggle */}
          <div className="px-4 pt-3 pb-0 border-b border-neutral-800 bg-[#1e1e1e] flex gap-4">
            <button
              onClick={() => setAddMode("single")}
              className={`pb-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                addMode === "single"
                  ? "border-[#a4c2b5] text-neutral-100"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> Single Add
            </button>
            <button
              onClick={() => setAddMode("bulk")}
              className={`pb-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                addMode === "bulk"
                  ? "border-[#a4c2b5] text-neutral-100"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <ListPlus className="h-3.5 w-3.5" /> Bulk Add (New Line)
            </button>
          </div>

          {/* Add Module Form */}
          <div className="p-4 border-b border-neutral-800 bg-[#1e1e1e]">
            {addMode === "single" ? (
              <form onSubmit={handleAddModule} className="flex gap-3">
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="e.g. Life Processes..."
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  type="submit"
                  disabled={!newModuleName.trim() || isAddingModule}
                  className="flex items-center gap-2 bg-[#2b2b2b] text-neutral-200 border border-neutral-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#8eb0a2] hover:text-neutral-900 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add Module
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleAddModulesBulk}
                className="flex flex-col gap-3"
              >
                <textarea
                  rows={4}
                  value={bulkModuleText}
                  onChange={(e) => setBulkModuleText(e.target.value)}
                  placeholder={
                    "Enter module names (one per line). E.g.\nIntroduction to Biology\nCell Structure and Function\nGenetics Basics"
                  }
                  className={`w-full resize-y min-h-[100px] ${inputClass}`}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!bulkModuleText.trim() || isAddingModule}
                    className="flex items-center gap-2 bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />{" "}
                    {isAddingModule ? "Adding..." : "Bulk Add Modules"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Modules List */}
          <div className="p-4 flex flex-col gap-2">
            {modules.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-sm">
                No modules added yet. Add your first topic above.
              </div>
            ) : (
              modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border border-neutral-800 bg-[#1e1e1e] group hover:border-neutral-700 transition-all ${module.isOptimistic ? "opacity-50 border-dashed animate-pulse" : ""}`}
                >
                  <div className="cursor-grab text-neutral-600 hover:text-neutral-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-center h-6 w-6 rounded bg-neutral-800 text-xs font-bold text-neutral-400 shrink-0">
                    {module.order_index || index + 1}
                  </div>

                  {editingModuleId === module.id ? (
                    <div className="flex-1 flex gap-2 items-center">
                      <input
                        type="text"
                        value={editingModuleName}
                        onChange={(e) => setEditingModuleName(e.target.value)}
                        className={`flex-1 ${inputClass} py-1`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveModuleEdit(module.id);
                          if (e.key === "Escape") setEditingModuleId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveModuleEdit(module.id)}
                        disabled={!editingModuleName.trim()}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-950/30 rounded border border-emerald-900/50 transition-all disabled:opacity-40"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingModuleId(null)}
                        className="p-1.5 text-neutral-400 hover:bg-neutral-800 rounded border border-neutral-800 transition-all"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 font-medium text-neutral-200">
                        {module.name}
                      </div>
                      {!module.isOptimistic && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingModuleId(module.id);
                              setEditingModuleName(module.name);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-[#a4c2b5] hover:bg-neutral-800 rounded transition-all"
                            title="Edit Module"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveModule(module.id, module.name)
                            }
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-all"
                            title="Remove Module"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
