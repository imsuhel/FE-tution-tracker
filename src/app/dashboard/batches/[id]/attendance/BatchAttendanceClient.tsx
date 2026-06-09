"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { 
  Search, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  Save
} from "lucide-react";
import { markBatchAttendance, getBatchAttendance } from "@/lib/actions/attendance.actions";

export default function BatchAttendanceClient({ 
  batch, 
  students: initialStudents 
}: { 
  batch: any, 
  students: any[] 
}) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize attendance states
  const [attendanceData, setAttendanceData] = useState<Record<string, "present" | "absent" | "holiday" | null>>(
    Object.fromEntries(initialStudents.map(s => [s.id, null]))
  );

  // Fetch existing attendance when date changes
  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      const result = await getBatchAttendance(batch.id, date);
      
      const newAttendance: Record<string, "present" | "absent" | "holiday" | null> = 
        Object.fromEntries(initialStudents.map(s => [s.id, null]));
      
      if (result.attendance && result.attendance.length > 0) {
        result.attendance.forEach((record: any) => {
          newAttendance[record.student_id] = record.status;
        });
      }
      
      setAttendanceData(newAttendance);
      setIsLoading(false);
    };

    fetchAttendance();
  }, [date, batch.id, initialStudents]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "holiday") => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }));
  };

  const handleSave = async () => {
    // Validation: Ensure everything is marked
    const unmarked = initialStudents.find(s => !attendanceData[s.id]);
    if (unmarked) {
       if (!confirm("Some students are not marked. They will not be saved. Continue?")) return;
    }

    setIsSaving(true);
    
    const records = initialStudents
      .filter(s => attendanceData[s.id] !== null)
      .map(s => ({
        student_id: s.id,
        enrollment_id: s.enrollment_id,
        status: attendanceData[s.id] as 'present' | 'absent' | 'holiday'
      }));

    if (records.length === 0) {
      alert("No attendance marked to save.");
      setIsSaving(false);
      return;
    }

    const result = await markBatchAttendance({
      batch_id: batch.id,
      date,
      records
    });

    setIsSaving(false);
    if (result.success) {
      alert("Attendance saved successfully!");
    } else {
      alert(result.error || "Failed to save attendance");
    }
  };

  const isFutureDate = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return dateStr > todayStr;
  };

  const handleDateChange = (newDate: string) => {
    if (isFutureDate(newDate)) {
      alert("Future attendance cannot be marked.");
      return;
    }
    setDate(newDate);
  };

  const getStatusClasses = (studentId: string, type: string) => {
    const isSelected = attendanceData[studentId] === type;
    if (!isSelected) return "border border-neutral-700 bg-[#1e1e1e] text-neutral-400 hover:bg-neutral-800";
    
    if (type === 'present') return "border border-green-500/50 bg-green-500/10 text-green-500 ring-2 ring-green-500/20";
    if (type === 'absent') return "border border-red-500/50 bg-red-500/10 text-red-500 ring-2 ring-red-500/20";
    if (type === 'holiday') return "border border-blue-400/50 bg-blue-400/10 text-blue-400 ring-2 ring-blue-400/20";
    return "";
  };

  const filteredStudents = useMemo(() => {
    return initialStudents.filter(s => 
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.roll_number || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [initialStudents, search]);

  const inputClass = "text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-colors";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
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
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">Attendance: {batch.name}</h1>
            <p className="text-sm text-neutral-400">{batch.course_name} • {batch.teacher_name}</p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#2b2b2b] border border-neutral-700 rounded-lg px-4 py-2 hover:border-neutral-500 transition-colors focus-within:border-[#a4c2b5] focus-within:ring-1 focus-within:ring-[#a4c2b5]">
            <CalendarIcon className="w-4 h-4 text-neutral-400" />
            <input 
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-sm font-medium text-neutral-100 bg-transparent focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Summary Legend - Moved Above Table */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Present</p>
            <p className="text-lg font-bold text-neutral-100">
              {Object.values(attendanceData).filter(v => v === 'present').length}
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Absent</p>
            <p className="text-lg font-bold text-neutral-100">
              {Object.values(attendanceData).filter(v => v === 'absent').length}
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-400/5 border border-blue-400/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Holiday</p>
            <p className="text-lg font-bold text-neutral-100">
              {Object.values(attendanceData).filter(v => v === 'holiday').length}
            </p>
          </div>
        </div>
      </div>

      <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#262626]">
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 w-full ${inputClass}`}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500 hidden sm:block">
              {initialStudents.length} Students Enrolled
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#a4c2b5] text-neutral-900 rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#8eb0a2] transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Attendance
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[#2b2b2b]/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#a4c2b5]" />
                <p className="text-sm text-neutral-400 font-medium">Loading records...</p>
              </div>
            </div>
          )}
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium text-center">Mark Attendance</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-neutral-500">
                    No students found in this batch.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={student.name?.[0]} className="h-9 w-9 text-xs bg-neutral-700" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-100 capitalize">{student.name}</span>
                            {student.roll_number && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                                {student.roll_number}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${getStatusClasses(student.id, 'present')}`}
                        >
                          <CheckCircle2 className="w-5 h-5 mb-0.5" />
                          <span className="text-[8px] font-bold uppercase">P</span>
                        </button>
                        <button 
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${getStatusClasses(student.id, 'absent')}`}
                        >
                          <XCircle className="w-5 h-5 mb-0.5" />
                          <span className="text-[8px] font-bold uppercase">A</span>
                        </button>
                        <button 
                          onClick={() => handleStatusChange(student.id, 'holiday')}
                          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${getStatusClasses(student.id, 'holiday')}`}
                        >
                          <AlertCircle className="w-5 h-5 mb-0.5" />
                          <span className="text-[8px] font-bold uppercase">H</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {attendanceData[student.id] ? (
                        <div className="flex justify-end">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                            ${attendanceData[student.id] === 'present' ? 'bg-green-500/20 text-green-500' : ''}
                            ${attendanceData[student.id] === 'absent' ? 'bg-red-500/20 text-red-500' : ''}
                            ${attendanceData[student.id] === 'holiday' ? 'bg-blue-400/20 text-blue-400' : ''}
                          `}>
                            {attendanceData[student.id]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-600 italic">Not marked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
