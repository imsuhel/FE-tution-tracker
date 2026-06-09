import { getFees } from "@/lib/actions/fee.actions";
import FeesClient from "./FeesClient";

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = params.search as string || "";
  const status = params.status as string || "all";

  const data = await getFees({ search, status });

  return (
    <FeesClient initialData={data} />
  );
}
