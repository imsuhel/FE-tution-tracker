import { getCourseById } from "@/lib/actions/course.actions";
import CourseDetailsClient from "./CourseDetailsClient";
import { notFound } from "next/navigation";

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getCourseById(resolvedParams.id);

  if (!data || !data.course) {
    notFound();
  }

  return (
    <CourseDetailsClient 
      initialCourse={data.course} 
      initialModules={data.modules || []} 
    />
  );
}
