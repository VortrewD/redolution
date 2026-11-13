"use client";

import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";
import { useMemo } from "react";

const WORD = "REDOLUTION";

export default function ScrollLetters() {
  const { scrollY } = useScroll();
  // Get the speed of the scroll (up or down)
  const scrollVelocity = useVelocity(scrollY);
  // Smooth out the velocity so it doesn't jerk too hard
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Transform the scroll speed into a rotation angle (aggressive spinning)
  const rotate = useTransform(smoothVelocity, [-1000, 1000], [-180, 180]);
  // Transform the scroll speed into a Y-axis movement (letters fly up/down)
  const y = useTransform(smoothVelocity, [-1000, 1000], [-100, 100]);

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
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 fixed">
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          className="absolute font-serif font-black select-none"
          style={{
            top: letter.top,
            left: letter.left,
            fontSize: `${letter.size}rem`,
            // Aggressive bright red, but highly transparent
            color: "rgba(239, 68, 68, 0.08)",
            WebkitTextStroke: "1.5px rgba(239, 68, 68, 0.15)",
            // Tie the motion to the scroll!
            rotate: rotate,
            y: y,
          }}
          initial={{ rotate: letter.initialRotate }}
          animate={{
            // Add a gentle baseline float so they move even when not scrolling
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