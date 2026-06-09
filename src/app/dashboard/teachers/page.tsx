import { getTeachers } from "@/lib/actions/teacher.actions";
import TeachersClient from "./TeachersClient";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const role = params.role as string || "";

  const teachers = await getTeachers({ role });

  return (
    <TeachersClient initialTeachers={teachers} />
  );
}
