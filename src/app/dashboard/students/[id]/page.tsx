import { getStudentById } from "@/lib/actions/student.actions";
import StudentDetailsClient from "./StudentDetailsClient";
import { notFound } from "next/navigation";

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getStudentById(resolvedParams.id);

  if (!data || !data.student) {
    notFound();
  }

  return (
    <StudentDetailsClient 
      initialStudent={data.student}
      initialBatches={data.batches || []}
      initialFees={data.fees || []}
      initialAttendance={data.attendance || []}
      initialTests={data.tests || []}
      initialReports={data.reports || []}
    />
  );
}
