"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { authApi } from "@/lib/api";

interface LoginViewProps {
  onSuccess: (user: any) => void;
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("nunawading@byd.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ email, password });
      if (res.access_token && res.user) {
        onSuccess(res.user);
      } else {
        setError("Invalid email or password.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#e60012]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-[#e60012] text-xs font-mono font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#e60012] animate-pulse" />
            BYD Harmony Lead Centre AI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            BYD LEADS CRM
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent Lead Qualification · Site Operations · Omnichannel Intake
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nunawading@byd.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] outline-none font-mono transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] outline-none font-mono transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#e60012] text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-950/50 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Lead Centre"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <span className="text-[11px] font-mono text-slate-400">
              Site Locked Account: <strong className="text-white">BYD Nunawading</strong>
            </span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] font-mono text-slate-500 text-center">
          Security: Role-Based Access · Site Isolation · End-to-End Encryption
        </p>
      </div>
    </div>
  );
}
