"use client";

import { motion } from "framer-motion";
import { Member } from "@/types";

interface Props {
  winner: Member;
  poolReset: boolean;
  eligible: Member[];
  onClose: () => void;
}

export function WinnerBanner({ winner, poolReset, eligible, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center space-y-4 px-8 py-8 bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-2xl max-w-sm w-full mx-4"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl"
        >
          🏆
        </motion.div>

        <div>
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">
            Winner!
          </p>
          <h2 className="text-3xl font-black text-white">{winner.name}</h2>
        </div>

        {poolReset && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2"
          >
            <p className="text-green-400 text-sm font-medium">
              🔄 Pool reset — everyone starts fresh!
            </p>
          </motion.div>
        )}

        {!poolReset && (
          <p className="text-gray-500 text-sm">
            {eligible.filter((m) => !m.drawn && m.id !== winner.id).length} members
            still in pool
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl transition-colors"
        >
          Next Race →
        </button>
      </motion.div>
    </motion.div>
  );
}
