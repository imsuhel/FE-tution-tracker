"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import apiClient from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      login(token, user);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  }

  // Google OAuth not supported in current custom backend, removing it for now.

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4 font-sans text-neutral-100">
      <div className="w-full max-w-sm bg-[#2b2b2b] border border-neutral-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#a4c2b5] flex items-center justify-center text-neutral-900 text-lg">
            🏫
          </div>
          <span className="font-bold text-neutral-100">
            Login to your institution
          </span>
        </div>
        <h1 className="text-xl font-medium text-neutral-200 mb-1">
          Unlock Your Campus Gateway - Sign In Now!
        </h1>

        {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 p-2 rounded-lg mb-4">{error}</p>}

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="text-right mb-4">
          <Link href="/auth/forgot-password" className="text-xs text-[#a4c2b5] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#a4c2b5] text-neutral-900 rounded-lg py-2.5 text-sm font-bold hover:bg-[#8eb0a2] transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}
