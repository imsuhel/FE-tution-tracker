import { getCenterProfile } from "@/lib/actions/center.actions";
import ProfileClient from "./ProfileClient";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getCenterProfile();

  if (!profile) {
    // In a real app, maybe redirect to setup or show error
    return (
      <div className="p-8 text-center text-neutral-400">
        Center profile not found. Please contact support.
      </div>
    );
  }

  return <ProfileClient initialProfile={profile} />;
}
