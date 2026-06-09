import { getBatchById, getBatchStudents } from "@/lib/actions/batch.actions";
import BatchAttendanceClient from "./BatchAttendanceClient";
import { notFound } from "next/navigation";

export default async function BatchAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [batch, students] = await Promise.all([
    getBatchById(resolvedParams.id),
    getBatchStudents(resolvedParams.id)
  ]);

  if (!batch) {
    notFound();
  }

  return (
    <BatchAttendanceClient 
      batch={batch} 
      students={students} 
    />
  );
}
