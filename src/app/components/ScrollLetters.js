"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const WORD = "REDOLUTION";

export default function ScrollLetters() {
  const letters = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const char = WORD[i % WORD.length];
      return {
        id: i,
        char,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 5 + 2,
        initialRotate: Math.random() * 90 - 45,
        duration: Math.random() * 8 + 12,
        delay: Math.random() * -15,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          className="absolute font-serif font-black select-none text-red-600/[0.08] [-webkit-text-stroke:1.5px_rgba(239,68,68,0.15)]"
          style={{
            top: letter.top,
            left: letter.left,
            fontSize: `${letter.size}rem`,
          }}
          initial={{ rotate: letter.initialRotate }}
          animate={{
            y: [0, -20, 0],
            rotate: [letter.initialRotate, letter.initialRotate + 5, letter.initialRotate],
          }}
          transition={{
            duration: letter.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: letter.delay,
          }}
        >
          {letter.char}
        </motion.div>
      ))}
    </div>
  );
}