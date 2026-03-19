"use client";

import { useState } from "react";
import { Member } from "@/types";

interface Props {
  members: Member[];
  onMembersChange: () => void;
}

export function MemberManager({ members, onMembersChange }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add member");
        return;
      }

      setName("");
      onMembersChange();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/members/${id}`, { method: "DELETE" });
      onMembersChange();
    } catch {
      // ignore
    }
  };

  const pool = members.filter((m) => !m.drawn);
  const drawn = members.filter((m) => m.drawn);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
      <h2 className="text-white font-semibold text-lg">Team Members</h2>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add team member..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {members.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-4">
          No members yet. Add your first team member above.
        </p>
      ) : (
        <div className="space-y-4">
          {pool.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                In Pool ({pool.length})
              </p>
              <div className="space-y-1.5">
                {pool.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {drawn.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Already Drawn ({drawn.length})
              </p>
              <div className="space-y-1.5">
                {drawn.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onDelete={handleDelete}
                    dimmed
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberRow({
  member,
  onDelete,
  dimmed = false,
}: {
  member: Member;
  onDelete: (id: string) => void;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${
        dimmed
          ? "bg-gray-800/40 border-gray-800 opacity-50"
          : "bg-gray-800 border-gray-700"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{dimmed ? "✓" : "🐎"}</span>
        <span
          className={`font-medium ${dimmed ? "line-through text-gray-500" : "text-white"}`}
        >
          {member.name}
        </span>
      </div>
      <button
        onClick={() => onDelete(member.id)}
        className="text-gray-600 hover:text-red-400 transition-colors text-sm px-2 py-1"
        aria-label={`Remove ${member.name}`}
      >
        ✕
      </button>
    </div>
  );
}
