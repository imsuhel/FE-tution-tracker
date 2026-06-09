import { getBatches } from "@/lib/actions/batch.actions";
import { getCourses } from "@/lib/actions/course.actions";
import { getTeachers } from "@/lib/actions/teacher.actions";
import BatchesClient from "./BatchesClient";

export default async function BatchesPage() {
  const [batches, courses, teachers] = await Promise.all([
    getBatches(),
    getCourses(),
    getTeachers({})
  ]);

  return (
    <BatchesClient 
      initialBatches={batches} 
      courses={courses} 
      teachers={teachers} 
    />
  );
}
