import { getCourses } from "@/lib/actions/course.actions";
import CoursesClient from "./CoursesClient";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <CoursesClient initialCourses={courses} />
  );
}
