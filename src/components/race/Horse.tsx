"use client";

import { motion } from "framer-motion";
import { Member } from "@/types";

interface Props {
  member: Member;
  targetX: number;
  isWinner: boolean;
  isRacing: boolean;
  colorClass: string;
  onAnimationComplete?: () => void;
}

export function Horse({
  member,
  targetX,
  isWinner,
  isRacing,
  colorClass,
  onAnimationComplete,
}: Props) {
  const duration = isWinner ? 2.8 : 2.0 + Math.random() * 0.6;

  return (
    <div
      className={`relative h-12 rounded-lg bg-gradient-to-r ${colorClass} border overflow-hidden`}
    >
      {/* Lane label */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center border-r border-white/5">
        <span className="text-gray-600 text-xs font-mono">
          {member.drawn && !isWinner ? "✓" : "—"}
        </span>
      </div>

      {/* Horse */}
      <motion.div
        className="absolute top-0 bottom-0 left-8 flex items-center gap-2 pr-3"
        animate={
          isRacing
            ? {
                x: targetX,
                y: isWinner
                  ? [0, -2, 1, -3, 0, -1, 2, 0, -2, 0]
                  : [0, -1, 2, -2, 1, -1, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={
          isRacing
            ? {
                x: {
                  duration,
                  ease: isWinner ? [0.2, 0, 0.05, 1] : [0.4, 0, 0.8, 1],
                },
                y: {
                  duration: duration * 0.15,
                  repeat: Math.ceil(duration / (duration * 0.15)),
                  ease: "easeInOut",
                },
              }
            : {}
        }
        onAnimationComplete={isRacing && onAnimationComplete ? onAnimationComplete : undefined}
      >
        <span
          className={`text-xl transition-transform ${
            isRacing && isWinner ? "scale-110" : ""
          }`}
        >
          🏇
        </span>
        <span
          className={`text-sm font-semibold whitespace-nowrap ${
            member.drawn && !isWinner
              ? "text-gray-500"
              : isWinner
              ? "text-yellow-300"
              : "text-white"
          }`}
        >
          {member.name}
        </span>
      </motion.div>
    </div>
  );
}
