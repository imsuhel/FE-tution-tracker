import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBatchById, getBatchStudents } from "@/lib/actions/batch.actions";
import { getExamsByBatch } from "@/lib/actions/exam.actions";
import MarksheetClient from "./MarksheetClient";

export default async function MarksheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [batch, students, exams] = await Promise.all([
    getBatchById(id),
    getBatchStudents(id),
    getExamsByBatch(id),
  ]);

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-neutral-400">Batch not found.</p>
        <Link
          href="/dashboard/batches"
          className="inline-flex items-center gap-2 text-sm text-[#a4c2b5] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Batches
        </Link>
      </div>
    );
  }

  return (
    <MarksheetClient
      batch={batch}
      students={students}
      initialExams={exams}
    />
  );
}
