"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const WORD = "REDOLUTION";

export default function FloatingLetters() {
  const letters = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const char = WORD[i % WORD.length];
      
      return {
        id: i,
        char,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2.5, 
        rotate: Math.random() * 60 - 30,
        duration: Math.random() * 12 + 18, 
        delay: Math.random() * -20, 
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          className="absolute font-serif font-black select-none text-red-600/[0.06] [-webkit-text-stroke:1.5px_rgba(220,38,38,0.12)]"
          style={{
            top: letter.top,
            left: letter.left,
            fontSize: `${letter.size}rem`,
          }}
          initial={{ y: 0, rotate: letter.rotate }}
          animate={{
            y: [0, -60, 0], 
            rotate: [letter.rotate, letter.rotate + 10, letter.rotate], 
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