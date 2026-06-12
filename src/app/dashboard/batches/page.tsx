import { getBatches } from "@/lib/actions/batch.actions";
import { getCourses } from "@/lib/actions/course.actions";
import { getTeachers } from "@/lib/actions/teacher.actions";
import { getTodayAttendanceSummary } from "@/lib/actions/attendance.actions";
import BatchesClient from "./BatchesClient";

export default async function BatchesPage() {
  const [batches, courses, teachers] = await Promise.all([
    getBatches(),
    getCourses(),
    getTeachers({})
  ]);

  // Fetch today's present count for all batches in parallel
  const batchIds = (batches as any[]).map((b: any) => b.id);
  const todayAttendance = await getTodayAttendanceSummary(batchIds);

  return (
    <BatchesClient 
      initialBatches={batches} 
      courses={courses} 
      teachers={teachers}
      todayAttendance={todayAttendance}
    />
  );
}
