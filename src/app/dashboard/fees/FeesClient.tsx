"use client";

import { useState } from "react";
import { Search, IndianRupee, CheckCircle2, AlertCircle, X, Download, FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { recordPayment } from "@/lib/actions/fee.actions";

export default function FeesClient({ initialData }: { initialData: any }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedFee, setSelectedFee] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState("");

  // Payment History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEnrollment, setSelectedHistoryEnrollment] = useState<any | null>(null);

  const { fees = [], metrics = { totalPending: 0, collectedThisMonth: 0, overdue: 0 } } = initialData || {};

  const formatCurrency = (amount: number) => `₹${(amount || 0).toLocaleString('en-IN')}`;
  const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  // Group fees by enrollment_id to display student-wise latest payments
  const groupedFeesList = (() => {
    const groups = new Map<string, any[]>();
    fees.forEach((fee: any) => {
      const key = fee.enrollment_id;
      if (key) {
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(fee);
      }
    });

    const list: any[] = [];
    groups.forEach((records) => {
      // Sort records by date descending (latest first)
      const sorted = [...records].sort((a, b) => {
        const dateA = new Date(a.payment_date || a.created_at).getTime();
        const dateB = new Date(b.payment_date || b.created_at).getTime();
        return dateB - dateA;
      });

      const latest = sorted[0];
      const unpaidFee = sorted.find(r => !(r.paid === 1 || r.paid === true));

      list.push({
        ...latest,
        unpaidFee,
        allRecords: sorted,
      });
    });
    return list;
  })();

  const filteredFees = groupedFeesList.filter((fee: any) => {
    const matchesSearch = fee.student_name?.toLowerCase().includes(search.toLowerCase()) || 
                          fee.batch_name?.toLowerCase().includes(search.toLowerCase()) ||
                          fee.enrollment_id?.toLowerCase().includes(search.toLowerCase());
    
    const totalExpected = Number(fee.course_total_fee) || 0;
    const totalPaid = Number(fee.course_paid_amount) || 0;
    const pending = Math.max(0, totalExpected - totalPaid);
    
    const matchesFilter = filter === "all" || 
                          (filter === "paid" && pending === 0) || 
                          (filter === "pending" && pending > 0);
    return matchesSearch && matchesFilter;
  });

  const handleRecordPayment = (fee: any) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.amount?.toString() || "");
    setShowPaymentModal(true);
  };

  const handleShowHistory = (fee: any) => {
    setSelectedHistoryEnrollment(fee);
    setShowHistoryModal(true);
  };

  const onConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedFee.course_total_fee !== undefined) {
      const totalExpected = Number(selectedFee.course_total_fee) || 0;
      const totalPaid = Number(selectedFee.course_paid_amount) || 0;
      const pending = Math.max(0, totalExpected - totalPaid);
      if (parseFloat(paymentAmount) > pending) {
        setError(`Cannot record payment of ${formatCurrency(parseFloat(paymentAmount))}. The pending amount for this course is ${formatCurrency(pending)}.`);
        return;
      }
    }

    setIsSubmitting(true);

    const result = await recordPayment(selectedFee.id, {
      amount: parseFloat(paymentAmount)
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setShowPaymentModal(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header & Metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Fee Management</h1>
          <p className="text-sm text-neutral-400 mt-1">Track student payments and outstanding balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neutral-800 rounded-md">
              <IndianRupee className="w-5 h-5 text-[#a4c2b5]" />
            </div>
            <h2 className="text-sm font-medium text-neutral-400">Total Pending</h2>
          </div>
          <p className="text-2xl font-bold text-neutral-100">{formatCurrency(metrics.totalPending)}</p>
        </Card>
        
        <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neutral-800 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-sm font-medium text-neutral-400">Collected This Month</h2>
          </div>
          <p className="text-2xl font-bold text-neutral-100">{formatCurrency(metrics.collectedThisMonth)}</p>
        </Card>

        <Card className="p-6 border-neutral-700/50 bg-[#2b2b2b]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neutral-800 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-sm font-medium text-neutral-400">Overdue Amount</h2>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(metrics.overdue)}</p>
        </Card>
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] transition-all"
          />
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#1e1e1e] border border-neutral-800 text-neutral-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* 3. Fees Table */}
      <Card className="overflow-hidden border-neutral-800 bg-[#2b2b2b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs text-neutral-500 uppercase bg-[#1e1e1e]/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Enrollment ID</th>
                <th className="px-6 py-4 font-medium">Batch</th>
                <th className="px-6 py-4 font-medium">Fee Amount</th>
                <th className="px-6 py-4 font-medium">Batch Pending</th>
                <th className="px-6 py-4 font-medium">Payment Date</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredFees.map((fee: any) => {
                const totalExpected = Number(fee.course_total_fee) || 0;
                const totalPaid = Number(fee.course_paid_amount) || 0;
                const pending = Math.max(0, totalExpected - totalPaid);
                return (
                  <tr key={fee.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={fee.student_name?.[0]} className="w-8 h-8 text-xs" />
                        <div>
                          <p className="font-medium text-neutral-200 capitalize">{fee.student_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-neutral-400 select-all" title={fee.enrollment_id}>
                      {fee.enrollment_id ? `${fee.enrollment_id.substring(0, 8)}...` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-neutral-200">{fee.batch_name || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-neutral-200">{formatCurrency(fee.amount)}</td>
                    <td className="px-6 py-4">
                      {fee.course_total_fee !== undefined ? (
                        <span className={`font-medium ${pending > 0 ? 'text-red-400 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30' : 'text-green-400 bg-green-950/20 px-2 py-0.5 rounded border border-green-900/30'}`}>
                          {pending > 0 ? formatCurrency(pending) : 'Full Paid'}
                        </span>
                      ) : (
                        <span className="text-neutral-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{formatDate(fee.payment_date || fee.created_at)}</td>
                  
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {fee.unpaidFee ? (
                          <button 
                            onClick={() => handleRecordPayment(fee.unpaidFee)}
                            className="text-[#a4c2b5] hover:text-[#8eb0a2] font-medium transition-colors text-sm"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-neutral-500 text-sm">Paid</span>
                        )}
                        <button 
                          onClick={() => handleShowHistory(fee)}
                          className="text-neutral-400 hover:text-neutral-200 font-medium transition-colors text-sm flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#2b2b2b] border-neutral-800 shadow-2xl overflow-hidden">
            <form onSubmit={onConfirmPayment}>
              <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-[#262626]">
                <h2 className="text-lg font-bold text-neutral-100">Record Payment</h2>
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-400">{error}</div>}

                <div className="flex items-center gap-4 mb-2 p-4 bg-[#1e1e1e] rounded-lg border border-neutral-800">
                  <Avatar initials={selectedFee.student_name?.[0]} className="w-10 h-10" />
                  <div>
                    <p className="font-medium text-neutral-100">{selectedFee.student_name}</p>
                    <p className="text-sm text-neutral-400">{selectedFee.batch_name}</p>
                  </div>
                </div>

                {selectedFee.course_total_fee !== undefined && (
                  (() => {
                    const totalExpected = Number(selectedFee.course_total_fee) || 0;
                    const totalPaid = Number(selectedFee.course_paid_amount) || 0;
                    const pending = Math.max(0, totalExpected - totalPaid);
                    return (
                      <div className="p-3 bg-[#1e1e1e] rounded-lg border border-neutral-800 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Course Total Expected:</span>
                          <span className="text-neutral-300 font-medium">{formatCurrency(totalExpected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Total Paid So Far:</span>
                          <span className="text-neutral-300 font-medium">{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between border-t border-neutral-800 pt-1 mt-1 font-bold">
                          <span className="text-neutral-400">Maximum Payable:</span>
                          <span className="text-red-400">{formatCurrency(pending)}</span>
                        </div>
                      </div>
                    );
                  })()
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-400">Amount Received (₹) *</label>
                  <input
                    name="amount"
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedFee.course_total_fee !== undefined ? Math.max(0, Number(selectedFee.course_total_fee) - Number(selectedFee.course_paid_amount)) : undefined}
                    className="w-full rounded-lg border border-neutral-700 bg-[#1e1e1e] px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5]"
                  />
                </div>
               
              </div>
              
              <div className="border-t border-neutral-800 px-6 py-4 bg-[#262626] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#a4c2b5] text-neutral-900 hover:bg-[#8eb0a2] transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirm Payment
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal && selectedHistoryEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-[#2b2b2b] border-neutral-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-[#262626]">
              <div>
                <h2 className="text-lg font-bold text-neutral-100 font-sans">Payment History</h2>
                <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                  Showing all fee records for <span className="capitalize text-neutral-200 font-medium">{selectedHistoryEnrollment.student_name}</span>
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Enrollment Info & Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-[#1e1e1e] rounded-lg border border-neutral-800">
                  <Avatar initials={selectedHistoryEnrollment.student_name?.[0]} className="w-10 h-10" />
                  <div>
                    <p className="font-semibold text-neutral-100 capitalize font-sans">{selectedHistoryEnrollment.student_name}</p>
                    <p className="text-xs text-neutral-400 font-mono select-all">ID: {selectedHistoryEnrollment.enrollment_id}</p>
                    <p className="text-xs text-neutral-400 mt-0.5 font-sans">Batch: {selectedHistoryEnrollment.batch_name || 'N/A'}</p>
                  </div>
                </div>

                {selectedHistoryEnrollment.course_total_fee !== undefined && (
                  (() => {
                    const totalExpected = Number(selectedHistoryEnrollment.course_total_fee) || 0;
                    const totalPaid = Number(selectedHistoryEnrollment.course_paid_amount) || 0;
                    const pending = Math.max(0, totalExpected - totalPaid);
                    return (
                      <div className="p-4 bg-[#1e1e1e] rounded-lg border border-neutral-800 text-xs space-y-1.5 flex flex-col justify-center font-sans">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Course Total Expected:</span>
                          <span className="text-neutral-300 font-medium">{formatCurrency(totalExpected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Total Paid So Far:</span>
                          <span className="text-green-400 font-medium">{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between border-t border-neutral-800/80 pt-1.5 mt-1 font-bold">
                          <span className="text-neutral-400">Pending Balance:</span>
                          <span className={pending > 0 ? 'text-red-400' : 'text-green-400'}>
                            {pending > 0 ? formatCurrency(pending) : 'Fully Paid'}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Records List Table */}
              <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#1e1e1e]">
                <table className="w-full text-left text-xs text-neutral-400">
                  <thead className="text-[10px] text-neutral-500 uppercase bg-[#262626] border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Month</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Payment Date</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {selectedHistoryEnrollment.allRecords.map((record: any) => {
                      const isRecordPaid = record.paid === 1 || record.paid === true;
                      return (
                        <tr key={record.id} className="hover:bg-neutral-800/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-neutral-200">{record.month}</td>
                          <td className="px-4 py-3 text-neutral-200">{formatCurrency(record.amount)}</td>
                          <td className="px-4 py-3">{isRecordPaid ? formatDate(record.payment_date) : 'N/A'}</td>
                          <td className="px-4 py-3">{record.payment_method || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              isRecordPaid 
                                ? 'text-green-400 bg-green-950/20 border-green-900/30' 
                                : 'text-red-400 bg-red-950/20 border-red-900/30'
                            }`}>
                              {isRecordPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!isRecordPaid ? (
                              <button 
                                onClick={() => {
                                  setShowHistoryModal(false);
                                  handleRecordPayment(record);
                                }}
                                className="text-[#a4c2b5] hover:text-[#8eb0a2] font-semibold transition-colors"
                              >
                                Record Payment
                              </button>
                            ) : (
                              <span className="text-neutral-500 font-medium">None</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="border-t border-neutral-800 px-6 py-4 bg-[#262626] flex justify-end font-sans">
              <button 
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium text-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
