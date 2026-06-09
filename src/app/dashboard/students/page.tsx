import { getStudents } from "@/lib/actions/student.actions";
import { getBatches } from "@/lib/actions/batch.actions";
import StudentsClient from "./StudentsClient";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const page = parseInt(params.page as string) || 1;
  const search = params.search as string || "";
  const classFilter = params.class as string || "";
  const feeStatus = params.fee_status as string || "all";

  // Fetch data on the server
  const [initialData, batches] = await Promise.all([
    getStudents({ page, search, class: classFilter, fee_status: feeStatus }),
    getBatches()
  ]);

  return (
    <StudentsClient 
      initialData={initialData} 
      batches={batches} 
    />
  );
}
