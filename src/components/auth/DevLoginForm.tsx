"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function DevLoginForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await signIn("dev-login", { name: name.trim(), callbackUrl: "/dashboard" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-left">
        <p className="text-yellow-500/80 text-xs font-medium">Dev mode only</p>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter any name..."
        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-yellow-500/50 transition-colors"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
      >
        {loading ? "Signing in..." : "Sign in (dev)"}
      </button>
    </form>
  );
}
