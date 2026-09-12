import React from "react";
import { motion } from "framer-motion";
import Starfield from "./Starfield";

export default function GamingBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#05050A]">
      {/* 
        Layer 1: Ambient Atmospheric Glows 
        Using framer-motion to create a very slow, subtle, continuous cinematic drift.
      */}
      <motion.div
        className="absolute top-0 left-0 w-[100vw] h-[100vh] z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Cyan Ambient Source - Top Left drifting */}
        <motion.div
          className="absolute -top-[20vh] -left-[20vw] w-[80vw] h-[80vh] blur-[120px] mix-blend-screen opacity-[0.25]"
          style={{ background: "radial-gradient(circle, #00f0ff, transparent 65%)" }}
          animate={{
            x: [0, 80, 0, -80, 0],
            y: [0, 50, 100, 50, 0],
            scale: [1, 1.15, 1, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Violet Ambient Source - Bottom Right drifting */}
        <motion.div
          className="absolute -bottom-[20vh] -right-[20vw] w-[90vw] h-[90vh] blur-[140px] mix-blend-screen opacity-[0.25]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 65%)" }}
          animate={{
            x: [0, -100, 0, 80, 0],
            y: [0, -80, -120, -60, 0],
            scale: [1, 0.9, 1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Magenta Ambient Source - Center subtle pulse */}
        <motion.div
          className="absolute top-[25vh] left-[25vw] w-[50vw] h-[50vh] blur-[150px] mix-blend-screen opacity-[0.15]"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Layer 2: Starfield Particles & Grid */}
      <div className="absolute inset-0 opacity-100 z-20">
         <Starfield />
      </div>

      {/* Layer 3: Overlays (Grain, Scanlines, Vignette) */}
      <div className="grain-overlay z-30 opacity-40 mix-blend-overlay" />
      <div className="scanlines z-30 opacity-30" />
      <div className="vignette-overlay z-30" />
    </div>
  );
}
