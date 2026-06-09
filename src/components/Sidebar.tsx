import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarCheck,
  FileBarChart,
  IndianRupee,
  Send,
  Settings,
  ExternalLink,
  X,
  BookOpen,
  UserCheck,
} from "lucide-react";

export function Sidebar({ 
  isOpen, 
  onClose,
  profile 
}: { 
  isOpen?: boolean; 
  onClose?: () => void;
  profile?: any;
}) {
  const name = profile?.name || "Bright Minds";
  const city = profile?.city || "Jalandhar";
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col shrink-0 border-r border-neutral-800 bg-[#2b2b2b] h-screen text-neutral-400`}>
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-[#a4c2b5] flex items-center justify-center text-[10px] font-bold text-neutral-900">
                {initials}
              </div>
              <div className="overflow-hidden">
                <h1 className="text-base font-bold text-neutral-100 truncate">
                  {name}
                </h1>
                <p className="text-xs truncate">{city}</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="md:hidden text-neutral-400 hover:text-neutral-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-6">
        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Main
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md bg-[#1a2f24] px-2 py-2 text-sm font-medium text-[#4ade80]"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/students"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            >
              <Users className="h-4 w-4" />
              Students
            </Link>
            <Link
              href="/dashboard/teachers"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              Teachers
            </Link>
            <Link
              href="/dashboard/courses"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <Link
              href="/dashboard/batches"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            >
              <Layers className="h-4 w-4" />
              Batches
            </Link>
            <Link
              href="/dashboard/marks"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            >
              <FileBarChart className="h-4 w-4" />
              Marks
            </Link>
          </div>
        </div>

        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Finance
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard/fees"
              className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200"
            >
              <div className="flex items-center gap-3">
                <IndianRupee className="h-4 w-4" />
                Fees
              </div>
              <div className="h-4 w-4 rounded-full bg-red-900 flex items-center justify-center">
                <div className="h-2 w-0.5 bg-red-500"></div>
              </div>
            </Link>
          </div>
        </div>

        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Communication
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200"
            >
              <Send className="h-4 w-4" />
              Parent reports
            </Link>
          </div>
        </div>

        <div>
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Settings
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="#"
              className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-neutral-800 hover:text-neutral-200"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                Settings
              </div>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>
    </aside>
    </>
  );
}
