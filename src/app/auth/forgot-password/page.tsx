"use client";
import { useState, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const inputClass =
    "w-full text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] focus:border-transparent transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4 font-sans text-neutral-100">
      <div className="w-full max-w-sm bg-[#2b2b2b] border border-neutral-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#a4c2b5] flex items-center justify-center text-neutral-900 text-lg">
            🏫
          </div>
          <span className="font-bold text-neutral-100">Tuition Tracker</span>
        </div>

        {/* STEP 1: Email */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-xl font-medium text-neutral-200 mb-2">
              Forgot password?
            </h1>
            <p className="text-sm text-neutral-400 mb-6">
              No worries, we'll send you reset instructions.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#a4c2b5] text-neutral-900 rounded-lg py-2.5 text-sm font-bold hover:bg-[#8eb0a2] transition-colors mb-6"
            >
              Send OTP
            </button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to log in
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-xl font-medium text-neutral-200 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-neutral-400 mb-6">
              We sent a 4-digit code to <span className="font-medium text-neutral-200">{email || "your email"}</span>
            </p>

            <div className="flex justify-between gap-3 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-14 h-14 text-center text-xl font-bold rounded-xl border border-neutral-700 bg-[#1e1e1e] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#a4c2b5] focus:border-transparent transition-colors"
                />
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-[#a4c2b5] text-neutral-900 rounded-lg py-2.5 text-sm font-bold hover:bg-[#8eb0a2] transition-colors mb-6"
            >
              Verify Code
            </button>

            <div className="text-center text-sm text-neutral-400">
              Didn't receive the email?{" "}
              <button className="text-[#a4c2b5] hover:underline font-medium ml-1">
                Click to resend
              </button>
            </div>
            
            <div className="text-center mt-6">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to email
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-xl font-medium text-neutral-200 mb-2">
              Set new password
            </h1>
            <p className="text-sm text-neutral-400 mb-6">
              Your new password must be different to previously used passwords.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              className="w-full bg-[#a4c2b5] text-neutral-900 rounded-lg py-2.5 text-sm font-bold hover:bg-[#8eb0a2] transition-colors mb-6"
            >
              Continue
            </button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
