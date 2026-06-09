import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowUpRight, GraduationCap, Users, BookOpen, Clock } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/dashboard.actions";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 md:p-5 flex flex-col gap-1 border-none bg-[#2b2b2b]">
          <div className="flex items-center gap-2 text-neutral-400 mb-1">
            <Users className="h-4 w-4" />
            <p className="text-sm font-medium">Total students</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-neutral-100">{stats.totalStudents}</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">across {stats.totalBatches} batches</p>
        </Card>
        
        <Card className="p-5 flex flex-col gap-1 border-none bg-[#2b2b2b]">
          <div className="flex items-center gap-2 text-neutral-400 mb-1">
            <GraduationCap className="h-4 w-4" />
            <p className="text-sm font-medium">Total Batches</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-[#4ade80]">{stats.totalBatches}</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">active this month</p>
        </Card>
        
        <Card className="p-5 flex flex-col gap-1 border-none bg-[#2b2b2b]">
          <div className="flex items-center gap-2 text-neutral-400 mb-1">
            <BookOpen className="h-4 w-4" />
            <p className="text-sm font-medium">Total Courses</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-[#fbbf24]">{stats.totalCourses}</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">curriculum modules</p>
        </Card>

        <Card className="p-5 flex flex-col gap-1 border-none bg-[#2b2b2b]">
          <div className="flex items-center gap-2 text-neutral-400 mb-1">
            <Clock className="h-4 w-4" />
            <p className="text-sm font-medium">Fees Status</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-[#ef4444]">Realtime</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">tracking enabled</p>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Students */}
        <Card className="p-4 md:p-6 flex flex-col gap-4 border-neutral-700/50 bg-[#2b2b2b]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-neutral-100">Recent students</h3>
            <Link href="/dashboard/students" className="px-4 py-1.5 rounded-md border border-neutral-600 text-sm font-medium hover:bg-neutral-800 transition-colors text-neutral-300">
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {stats.recentStudents.length === 0 ? (
              <p className="text-sm text-neutral-500 py-10 text-center">No students registered yet.</p>
            ) : (
              stats.recentStudents.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar initials={student.name?.[0]} className="bg-[#d1e7dd] text-[#0f5132]" />
                    <div>
                      <p className="text-sm font-bold text-neutral-100">{student.name}</p>
                      <p className="text-xs text-neutral-400">{student.class} • {student.batch_name || 'Unassigned'}</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Batches */}
        <Card className="p-4 md:p-6 flex flex-col gap-4 border-neutral-700/50 bg-[#2b2b2b]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-neutral-100">Batches</h3>
            <Link href="/dashboard/batches" className="px-4 py-1.5 rounded-md border border-neutral-600 text-sm font-medium hover:bg-neutral-800 transition-colors text-neutral-300">
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {stats.recentBatches.length === 0 ? (
              <p className="text-sm text-neutral-500 py-10 text-center">No batches created yet.</p>
            ) : (
              stats.recentBatches.map((batch: any) => (
                <div key={batch.id} className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-[#4ade80]" />
                    <div>
                      <p className="text-sm font-bold text-neutral-100">{batch.name}</p>
                      <p className="text-xs text-neutral-400">{batch.course_name} • {batch.teacher_name}</p>
                    </div>
                  </div>
                  <Badge variant="info">Active</Badge>
                </div>
              ))
            )}
          </div>

          <Link href="/dashboard/batches" className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-neutral-600 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors w-full sm:w-auto text-neutral-300">
            <span className="text-lg leading-none mb-0.5">+</span> New batch <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
