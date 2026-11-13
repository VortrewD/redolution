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
        size: Math.random() * 4 + 2.5, // Generous sizing (2.5rem to 6.5rem)
        rotate: Math.random() * 60 - 30,
        duration: Math.random() * 12 + 18, // Very slow, 18s to 30s
        delay: Math.random() * -20, // Staggered start
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          className="absolute font-serif font-black select-none"
          style={{
            top: letter.top,
            left: letter.left,
            fontSize: `${letter.size}rem`,
            // The exact color: Red but VERY transparent so it acts as a "watermark"
            color: "rgba(220, 38, 38, 0.06)", 
            // A slight outline makes it look like your image (graded/textured)
            WebkitTextStroke: "1.5px rgba(220, 38, 38, 0.12)",
          }}
          initial={{ y: 0, rotate: letter.rotate }}
          animate={{
            y: [0, -60, 0], // Floats up and down gracefully
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