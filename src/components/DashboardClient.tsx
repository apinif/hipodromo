"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Member } from "@/types";
import { MemberManager } from "./members/MemberManager";
import { Header } from "./Header";

const RaceTrack = dynamic(() => import("./race/RaceTrack"), { ssr: false });

interface Props {
  initialMembers: Member[];
  lastWinner: string | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function DashboardClient({ initialMembers, lastWinner, user }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const refreshMembers = useCallback(async () => {
    const res = await fetch("/api/members");
    const data = await res.json();
    setMembers(
      data.members.map((m: Member & { createdAt: string | Date }) => ({
        ...m,
        createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
      }))
    );
  }, []);

  const pool = members.filter((m) => !m.drawn);
  const drawn = members.filter((m) => m.drawn);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* Pool status */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pool</p>
              <p className="text-white font-bold text-lg">
                {pool.length}{" "}
                <span className="text-gray-400 font-normal text-sm">
                  / {members.length} remaining
                </span>
              </p>
            </div>
          </div>

          {lastWinner && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-xs text-yellow-500/70 uppercase tracking-wide">Last drawn</p>
                <p className="text-yellow-400 font-bold">{lastWinner}</p>
              </div>
            </div>
          )}

          {drawn.length > 0 && pool.length === 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <p className="text-green-400 font-semibold text-sm">
                All members drawn! Pool resets next draw.
              </p>
            </div>
          )}
        </div>

        {/* Race track */}
        {members.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4">🐎</p>
            <p className="text-gray-400 text-lg">No team members yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Add members below to start the race
            </p>
          </div>
        ) : (
          <RaceTrack members={members} onDrawComplete={refreshMembers} />
        )}

        {/* Member manager */}
        <MemberManager members={members} onMembersChange={refreshMembers} />
      </main>
    </div>
  );
}
