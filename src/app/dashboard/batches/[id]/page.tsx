import { getBatchById, getBatchStudents } from "@/lib/actions/batch.actions";
import { getStudents } from "@/lib/actions/student.actions";
import { getTeachers } from "@/lib/actions/teacher.actions";
import { getCourses } from "@/lib/actions/course.actions";
import BatchDetailsClient from "./BatchDetailsClient";
import { notFound } from "next/navigation";

export default async function BatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch everything in parallel
  const [batch, enrolledStudents, allStudentsData, teachers, courses] = await Promise.all([
    getBatchById(resolvedParams.id),
    getBatchStudents(resolvedParams.id),
    getStudents({ limit: 100 }), // Get some students for the search/add modal
    getTeachers(),
    getCourses()
  ]);

  if (!batch) {
    notFound();
  }

  return (
    <BatchDetailsClient 
      initialBatch={batch} 
      initialEnrolledStudents={enrolledStudents}
      allStudents={allStudentsData.students || []}
      teachers={teachers}
      courses={courses}
    />
  );
}
