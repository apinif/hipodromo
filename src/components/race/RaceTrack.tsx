"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Member, DrawResult } from "@/types";
import { Horse } from "./Horse";
import { WinnerBanner } from "./WinnerBanner";

interface Props {
  members: Member[];
  onDrawComplete: () => void;
}

type RacePhase = "idle" | "countdown" | "racing" | "finished";

const LANE_COLORS = [
  "from-indigo-900/40 border-indigo-700/40",
  "from-purple-900/40 border-purple-700/40",
  "from-rose-900/40 border-rose-700/40",
  "from-cyan-900/40 border-cyan-700/40",
  "from-amber-900/40 border-amber-700/40",
  "from-emerald-900/40 border-emerald-700/40",
  "from-pink-900/40 border-pink-700/40",
  "from-orange-900/40 border-orange-700/40",
];

export default function RaceTrack({ members, onDrawComplete }: Props) {
  const [phase, setPhase] = useState<RacePhase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<Member | null>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [poolReset, setPoolReset] = useState(false);
  const [error, setError] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<DrawResult | null>(null);

  const pool = members.filter((m) => !m.drawn);

  const handleDraw = useCallback(async () => {
    if (phase !== "idle") return;
    setError("");
    setPhase("countdown");
    setWinner(null);

    // Start countdown
    let count = 3;
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownInterval);
        startRace();
      }
    }, 700);

    // Fetch winner while countdown plays
    fetch("/api/draw", { method: "POST" })
      .then((res) => res.json())
      .then((data: DrawResult) => {
        resultRef.current = data;
      })
      .catch(() => {
        clearInterval(countdownInterval);
        setError("Failed to draw. Try again.");
        setPhase("idle");
      });
  }, [phase]);

  const startRace = useCallback(() => {
    // Wait for result to be ready (retry if not yet)
    const tryStart = () => {
      if (!resultRef.current) {
        setTimeout(tryStart, 100);
        return;
      }

      const result = resultRef.current;
      const trackWidth = trackRef.current?.offsetWidth ?? 600;

      // Compute positions: winner goes full track, losers stop short
      const newPositions: Record<string, number> = {};
      members.forEach((m) => {
        if (m.id === result.winner.id) {
          newPositions[m.id] = trackWidth * 0.88;
        } else {
          // Random stop between 55-80% of track
          newPositions[m.id] = trackWidth * (0.55 + Math.random() * 0.25);
        }
      });

      setPositions(newPositions);
      setWinner(result.winner);
      setPoolReset(result.poolReset);
      setPhase("racing");
    };

    tryStart();
  }, [members]);

  const handleRaceEnd = useCallback(() => {
    setPhase("finished");
  }, []);

  const handleClose = useCallback(() => {
    setPhase("idle");
    setWinner(null);
    setPositions({});
    resultRef.current = null;
    onDrawComplete();
  }, [onDrawComplete]);

  const eligible = pool.length > 0 ? pool : members;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Track header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏁</span>
          <span className="text-white font-semibold">Race Track</span>
        </div>
        <div className="text-gray-500 text-sm">
          {pool.length > 0
            ? `${pool.length} in pool`
            : "Pool empty — will reset on next draw"}
        </div>
      </div>

      {/* Lanes */}
      <div ref={trackRef} className="relative p-4 space-y-2">
        {/* Finish line */}
        <div
          className="absolute top-0 bottom-0 w-px z-10 pointer-events-none"
          style={{ right: "12%" }}
        >
          <div className="h-full w-1 bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-60" />
          <div
            className="absolute top-2 -translate-x-1/2 text-yellow-400 text-xs font-bold"
            style={{ left: "50%" }}
          >
            FINISH
          </div>
        </div>

        {members.map((member, i) => (
          <Horse
            key={member.id}
            member={member}
            targetX={positions[member.id] ?? 0}
            isWinner={winner?.id === member.id}
            isRacing={phase === "racing"}
            colorClass={LANE_COLORS[i % LANE_COLORS.length]}
            onAnimationComplete={
              winner?.id === member.id ? handleRaceEnd : undefined
            }
          />
        ))}
      </div>

      {/* Draw button */}
      <div className="px-6 pb-6">
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          onClick={handleDraw}
          disabled={phase !== "idle" || members.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl transition-colors"
        >
          {phase === "idle" && "🎲 Draw!"}
          {phase === "countdown" && `🔔 ${countdown}...`}
          {phase === "racing" && "🏇 Racing..."}
          {phase === "finished" && "✅ Done"}
        </button>
      </div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <span className="text-8xl font-black text-white drop-shadow-2xl">
              {countdown}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner banner */}
      <AnimatePresence>
        {phase === "finished" && winner && (
          <WinnerBanner
            winner={winner}
            poolReset={poolReset}
            eligible={eligible}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
