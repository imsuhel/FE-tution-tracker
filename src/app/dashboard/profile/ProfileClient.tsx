"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { updateCenterProfile } from "@/lib/actions/center.actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfileClient({ initialProfile }: { initialProfile: any }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [profile, setProfile] = useState(initialProfile);

  function updateField(field: string, value: string) {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    const result = await updateCenterProfile(profile);
    
    setLoading(false);
    if (result.success) {
      setSuccessMsg("Profile updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setErrorMsg(result.error || "Failed to update profile");
    }
  }

  const inputClass =
    "w-full text-sm px-4 py-2.5 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider";

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 mb-1">Center Profile</h1>
        <p className="text-sm text-neutral-400">Manage your institute's public details and contact information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-8 border-neutral-700/50 bg-[#2b2b2b]">
            <form onSubmit={handleSave} className="space-y-8">
              {successMsg && (
                <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5" />
                  {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-400 mb-6 flex items-center gap-2">
                    <span className="h-1 w-4 bg-[#a4c2b5] rounded-full" />
                    Institute Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Center Name *</label>
                      <input
                        type="text"
                        required
                        className={inputClass}
                        placeholder="e.g. Bright Minds Classes"
                        value={profile.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Owner / Director Name *</label>
                      <input
                        type="text"
                        required
                        className={inputClass}
                        placeholder="Full name"
                        value={profile.owner_name}
                        onChange={(e) => updateField("owner_name", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-400 mb-6 flex items-center gap-2 pt-4">
                    <span className="h-1 w-4 bg-[#a4c2b5] rounded-full" />
                    Contact & Location
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Phone Number *</label>
                        <input
                          type="tel"
                          required
                          className={inputClass}
                          placeholder="+91 98765 43210"
                          value={profile.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>City *</label>
                        <input
                          type="text"
                          required
                          className={inputClass}
                          placeholder="e.g. Jalandhar"
                          value={profile.city}
                          onChange={(e) => updateField("city", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Full Address</label>
                      <textarea
                        className={inputClass}
                        placeholder="Complete street address"
                        rows={3}
                        style={{ resize: "none" }}
                        value={profile.address || ""}
                        onChange={(e) => updateField("address", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#a4c2b5] text-neutral-900 rounded-xl px-8 py-3 text-sm font-bold hover:bg-[#8eb0a2] transition-all transform active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-[#a4c2b5]/10"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
