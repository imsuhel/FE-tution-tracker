import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-neutral-800 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-neutral-800 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-neutral-800 rounded-lg"></div>
      </div>

      <Card className="flex flex-col border-neutral-700/50 bg-[#2b2b2b] overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#262626]">
          <div className="h-10 w-full md:w-64 bg-neutral-800 rounded-lg"></div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="h-10 w-32 bg-neutral-800 rounded-lg"></div>
            <div className="h-10 w-32 bg-neutral-800 rounded-lg"></div>
            <div className="h-10 w-24 bg-neutral-800 rounded-lg"></div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-neutral-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-neutral-800 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-neutral-800 rounded-md"></div>
                  <div className="h-3 w-24 bg-neutral-800 rounded-md"></div>
                </div>
              </div>
              <div className="h-4 w-24 bg-neutral-800 rounded-md"></div>
              <div className="h-4 w-24 bg-neutral-800 rounded-md"></div>
              <div className="h-8 w-16 bg-neutral-800 rounded-md"></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
