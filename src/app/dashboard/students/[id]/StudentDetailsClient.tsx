"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Phone, MapPin, Calendar, BookOpen, Clock, Download, FileText, CheckCircle2, XCircle, AlertCircle, Mail, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";
import { createFee } from "@/lib/actions/fee.actions";

export default function StudentDetailsClient({
  initialStudent,
  initialBatches,
  initialFees,
  initialAttendance,
  initialTests,
  initialReports
}: {
  initialStudent: any,
  initialBatches: any[],
  initialFees: any[],
  initialAttendance: any[],
  initialTests: any[],
  initialReports: any[]
}) {
  const router = useRouter();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ enrollment_id: "", amount: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = initialStudent;
  const batches = initialBatches || [];
  const fees = initialFees || [];
  const attendance = initialAttendance || [];
  const tests = initialTests || [];
  const reports = initialReports || [];

  // --- HELPERS ---
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // MySQL TINYINT(1) might return as a Buffer, 0/1, or boolean
  const isPaid = (val: any) => {
    if (val === 1 || val === true) return true;
    if (val === 0 || val === false) return false;
    if (val && val.type === 'Buffer' && Array.isArray(val.data)) return val.data[0] === 1;
    return Boolean(val);
  };

  const getBatchFeeDetails = (batch: any) => {
    const durationMonths = parseInt(batch.duration) || 0;
    const monthlyFee = batch.monthly_fee || 0;
    const totalExpected = durationMonths * monthlyFee;
    
    const totalPaid = fees
      .filter(f => f.enrollment_id === batch.enrollment_id && isPaid(f.paid))
      .reduce((acc, f) => acc + f.amount, 0);
      
    const pending = Math.max(0, totalExpected - totalPaid);
    
    return { totalExpected, totalPaid, pending };
  };

  const pendingTotal = batches.reduce((acc, batch) => acc + getBatchFeeDetails(batch).pending, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.enrollment_id || !paymentForm.amount) return;

    const selectedBatch = batches.find(b => b.enrollment_id === paymentForm.enrollment_id);
    if (selectedBatch) {
      const { pending } = getBatchFeeDetails(selectedBatch);
      if (Number(paymentForm.amount) > pending) {
        alert(`Cannot record payment of ${formatCurrency(Number(paymentForm.amount))}. The pending amount for this course is ${formatCurrency(pending)}.`);
        return;
      }
    }
    
    setIsSubmitting(true);
    const result = await createFee({
      enrollment_id: paymentForm.enrollment_id,
      amount: Number(paymentForm.amount),
      is_payment: true
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsPaymentModalOpen(false);
      setPaymentForm({ enrollment_id: "", amount: "" });
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  if (!student) {
    return <div className="p-8 text-center text-red-400">Student not found</div>;
  }

  const initials = student.name ? student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              initials={initials}
              className="h-16 w-16 text-xl bg-[#a4c2b5] text-neutral-900"
            />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-neutral-100 capitalize">
                  {student.name}
                </h1>
                <Badge variant={pendingTotal > 0 ? "warning" : "success"}>
                  {pendingTotal > 0 ? "Fees Pending" : "Up to Date"}
                </Badge>
              </div>
              <p className="text-sm text-neutral-400">
                {student.class || "N/A"} • {student.roll_number}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border border-neutral-700 text-sm font-medium hover:bg-neutral-800 transition-colors">
              Edit Student
            </button>
          </div>
        </div>
      </div>

      {/* 2. Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b] md:col-span-2">
          <h2 className="text-lg font-bold text-neutral-100 mb-4">
            Personal & Parent Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Email</p>
                <p className="text-sm text-neutral-200">
                  {student.email || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Date of Birth</p>
                <p className="text-sm text-neutral-200">
                  {formatDate(student.dob)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Class / Grade</p>
                <p className="text-sm text-neutral-200">
                  {student.class || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Parent Name</p>
                <p className="text-sm text-neutral-200">
                  {student.parent_name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">
                  Contact Number
                </p>
                <p className="text-sm text-neutral-200">
                  {student.parent_phone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b] flex flex-col h-full">
          <h2 className="text-lg font-bold text-neutral-100 mb-4">
            Batch Details
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {batches.length > 0 ? (
              batches.map((batch, idx) => {
                const feeDetails = getBatchFeeDetails(batch);
                return (
                  <div
                    key={batch.id || idx}
                    className="p-3 bg-[#1e1e1e] rounded-lg border border-neutral-800"
                  >
                    <div className="mb-2 flex justify-between items-start">
                      <p className="text-sm text-neutral-200 font-bold">
                        {batch.name}
                      </p>
                      {feeDetails.pending > 0 ? (
                        <span className="text-xs font-bold text-red-400 border border-red-900 bg-red-950/30 px-2 py-0.5 rounded">
                          {formatCurrency(feeDetails.pending)} Due
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-400 border border-green-900 bg-green-950/30 px-2 py-0.5 rounded">
                          Fully Paid
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-xs text-neutral-500">Subject</p>
                        <p className="text-neutral-300 truncate">
                          {batch.subject || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Teacher</p>
                        <p className="text-neutral-300 truncate">
                          {batch.teacher || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-800 flex justify-between text-xs">
                      <div>
                        <span className="text-neutral-500">Expected:</span>{" "}
                        <span className="text-neutral-300">
                          {formatCurrency(feeDetails.totalExpected)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Paid:</span>{" "}
                        <span className="text-neutral-300">
                          {formatCurrency(feeDetails.totalPaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-neutral-500">No batches assigned</p>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Fees & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fees */}
        <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#262626]">
            <h2 className="text-lg font-bold text-neutral-100">Fee History</h2>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Total Pending</p>
              <p className="text-lg font-bold text-[#ef4444]">
                {formatCurrency(pendingTotal)}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Payment Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {fees.length > 0 ? (
                  fees.map((fee, i) => (
                    <tr
                      key={fee.id || i}
                      className="hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-6 py-3 text-neutral-200">
                        {fee.month}
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="px-6 py-3">{formatDate(fee.payment_date || fee.created_at)}</td>
                      <td className="px-6 py-3">
                        {isPaid(fee.paid) ? (
                          <Badge variant="success">Paid</Badge>
                        ) : (
                          <Badge variant="error">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-neutral-500"
                    >
                      No fee records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pendingTotal > 0 && (
            <div className="p-4 border-t border-neutral-800 bg-[#262626]">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full bg-[#a4c2b5] text-neutral-900 rounded-md py-2 text-sm font-medium hover:bg-[#8eb0a2] transition-colors"
              >
                Record Payment
              </button>
            </div>
          )}
        </Card>

        {/* Attendance */}
        <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#262626]">
            <h2 className="text-lg font-bold text-neutral-100">
              Recent Attendance
            </h2>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Latest Records</p>
              <p className="text-lg font-bold text-[#a4c2b5]">
                {attendance.length}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Batch</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {attendance.length > 0 ? (
                  attendance.map((record, i) => (
                    <tr
                      key={i}
                      className="hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-6 py-3 text-neutral-200">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-3 text-neutral-300">
                        {record.batch_name || "N/A"}
                      </td>
                      <td className="px-6 py-3 flex items-center gap-2">
                        {record.status === "present" && (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />{" "}
                            <span className="text-green-500 capitalize">
                              {record.status}
                            </span>
                          </>
                        )}
                        {record.status === "absent" && (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />{" "}
                            <span className="text-red-500 capitalize">
                              {record.status}
                            </span>
                          </>
                        )}
                        {record.status === "late" && (
                          <>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />{" "}
                            <span className="text-yellow-500 capitalize">
                              {record.status}
                            </span>
                          </>
                        )}
                        {record.status !== "present" &&
                          record.status !== "absent" &&
                          record.status !== "late" && (
                            <>
                              <AlertCircle className="w-4 h-4 text-neutral-500" />{" "}
                              <span className="text-neutral-500 capitalize">
                                {record.status}
                              </span>
                            </>
                          )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-neutral-500"
                    >
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-neutral-800 bg-[#262626] flex justify-center">
            <button className="text-sm text-[#a4c2b5] hover:underline">
              View Full Log
            </button>
          </div>
        </Card>
      </div>

      {/* 4. Tests & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
          <div className="p-6 border-b border-neutral-800 bg-[#262626]">
            <h2 className="text-lg font-bold text-neutral-100">
              Academic Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Test Name</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {tests.length > 0 ? (
                  tests.map((test, i) => {
                    const percentage = Math.round(
                      (test.obtained / test.totalMarks) * 100,
                    );
                    return (
                      <tr
                        key={i}
                        className="hover:bg-neutral-800/30 transition-colors"
                      >
                        <td className="px-6 py-3 text-neutral-200 font-medium">
                          {test.name}
                        </td>
                        <td className="px-6 py-3">{formatDate(test.date)}</td>
                        <td className="px-6 py-3">
                          {test.obtained} / {test.totalMarks}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`font-bold ${percentage >= 80 ? "text-green-500" : percentage >= 40 ? "text-yellow-500" : "text-red-500"}`}
                          >
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-neutral-500"
                    >
                      No test records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Parent Reports */}
        <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
          <div className="p-6 border-b border-neutral-800 bg-[#262626]">
            <h2 className="text-lg font-bold text-neutral-100">
              Parent Reports
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {reports.length > 0 ? (
                  reports.map((report, i) => (
                    <tr
                      key={i}
                      className="hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-neutral-200">
                        {report.month}
                      </td>
                      <td className="px-6 py-4">
                        {report.status === "sent" ? (
                          <Badge variant="success">Sent</Badge>
                        ) : (
                          <Badge variant="warning">Draft</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-2 text-sm text-[#a4c2b5] hover:text-white transition-colors">
                          <FileText className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-neutral-500"
                    >
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-[#1e1e1e] border border-neutral-800 shadow-2xl">
            <div className="flex justify-between gap-3 mb-1">
              <h1 className="text-2xl font-bold text-neutral-100 capitalize">
                Record Payment
              </h1>
              <div>
                <p className="text-sm text-neutral-400">Total Pending Fees</p>
                <p className="text-xl font-bold text-[#ef4444]">
                  {formatCurrency(pendingTotal)}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleRecordPayment}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Select Batch
                </label>
                <select
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#2b2b2b] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5]"
                  value={paymentForm.enrollment_id}
                  onChange={(e) => {
                    const batch = batches.find(
                      (b) => b.enrollment_id === e.target.value,
                    );
                    const pending = batch
                      ? getBatchFeeDetails(batch).pending
                      : 0;
                    setPaymentForm({
                      ...paymentForm,
                      enrollment_id: e.target.value,
                      amount: pending > 0 ? String(pending) : "",
                    });
                  }}
                  required
                >
                  <option value="">-- Choose a Batch --</option>
                  {batches.map((b) => (
                    <option key={b.enrollment_id} value={b.enrollment_id}>
                      {b.name} (Due:{" "}
                      {formatCurrency(getBatchFeeDetails(b).pending)})
                    </option>
                  ))}
                </select>
              </div>

              {paymentForm.enrollment_id && (
                (() => {
                  const selectedBatch = batches.find(b => b.enrollment_id === paymentForm.enrollment_id);
                  if (!selectedBatch) return null;
                  const feeDetails = getBatchFeeDetails(selectedBatch);
                  return (
                    <div className="p-3 bg-[#1e1e1e] rounded-lg border border-neutral-800 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Course Total Expected:</span>
                        <span className="text-neutral-300 font-medium">{formatCurrency(feeDetails.totalExpected)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Total Paid So Far:</span>
                        <span className="text-neutral-300 font-medium">{formatCurrency(feeDetails.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-800 pt-1 mt-1 font-bold">
                        <span className="text-neutral-400">Maximum Payable:</span>
                        <span className="text-red-400">{formatCurrency(feeDetails.pending)}</span>
                      </div>
                    </div>
                  );
                })()
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#2b2b2b] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5]"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  placeholder="e.g. 1500"
                  required
                  min="1"
                  max={paymentForm.enrollment_id ? getBatchFeeDetails(batches.find(b => b.enrollment_id === paymentForm.enrollment_id)).pending : undefined}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#a4c2b5] text-neutral-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#8eb0a2] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
