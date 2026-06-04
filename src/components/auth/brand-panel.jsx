import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
const slides = [
  {
    title: "Website Development",
    description:
      "Modern websites built for performance, responsiveness, and growth.",
    image:
      "https://images.unsplash.com/photo-1481487196290-c152efe083f5?auto=format&fit=crop&q=80&w=600",
    badge: "Web",
    badgeColor: "bg-blue-500",
  },
  {
    title: "Email Marketing",
    description:
      "Effective, hyper-targeted campaigns that reach and convert customers.",
    image:
      "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=600",
    badge: "Email",
    badgeColor: "bg-pink-500",
  },
  {
    title: "Mobile App Development",
    description: "Seamless mobile experiences designed across all devices.",
    image:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=600",
    badge: "Mobile",
    badgeColor: "bg-purple-500",
  },
  {
    title: "Digital Marketing",
    description:
      "Results-focused digital strategy to expand your brand's reach.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    badge: "Marketing",
    badgeColor: "bg-green-500",
  },
];
export default function BrandPanel() {
  const companyDetails = useSelector((state) => state.company.companyDetails);
  const [activeSlide, setActiveSlide] = useState(0);
  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="hidden lg:flex lg:col-span-3 flex-col justify-between p-12 relative overflow-hidden text-white min-h-[650px] bg-[#1c52d5]"
    >
      {/* ── Abstract Decorative Shapes ── */}
      {/* Pink semicircle — top left */}
      <div className="absolute -top-12 -left-12 w-44 h-44 bg-[#f472b6] rounded-full opacity-90 pointer-events-none z-0" />
      {/* Red dot grid — top right */}
      <div className="absolute top-8 right-12 grid grid-cols-6 gap-2 opacity-80 pointer-events-none z-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
        ))}
      </div>
      {/* Pink triangle + square — far right accent */}
      <div className="absolute right-6 top-32 flex flex-col gap-4 opacity-80 pointer-events-none z-0">
        <svg
          className="w-6 h-6 text-[#f472b6] fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
        <div className="w-5 h-5 rounded bg-[#f472b6]" />
      </div>
      {/* ── Top spacer ── */}
      <div className="h-10 z-10" />
      {/* ── Laptop Mockup ── */}
      <div className="relative z-10 flex items-center justify-center py-6 w-full">
        <div className="w-full max-w-[420px]">
          {/* Screen lid */}
          <div className="bg-[#1a1a2e] rounded-t-2xl px-4 pt-4 pb-3 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/10 relative">
            {/* Camera dot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 mb-2.5 pt-2">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
                <span className="w-2 h-2 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 bg-white/10 rounded-full px-3 py-0.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[9px] text-white/50 font-mono truncate"
                  >
                    {activeSlide === 0 && "Ag Solutions/web"}
                    {activeSlide === 1 && "Ag Solutions/email"}
                    {activeSlide === 2 && "Ag Solutions/mobile"}
                    {activeSlide === 3 && "Ag Solutions/marketing"}
                  </motion.span>
                </AnimatePresence>
              </div>
              {/* Live badge */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeSlide}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className={`text-[8px] text-white font-black uppercase px-2 py-0.5 rounded-full ${slides[activeSlide].badgeColor}`}
                >
                  {slides[activeSlide].badge}
                </motion.span>
              </AnimatePresence>
            </div>
            {/* ── Screen Viewport ── image crossfades here */}
            <div className="rounded-lg overflow-hidden h-[185px] bg-zinc-900 relative border border-white/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlide}
                  src={slides[activeSlide].image}
                  alt={slides[activeSlide].title}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full h-full object-cover object-top"
                />
              </AnimatePresence>
              {/* Progress bar at bottom of screen */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
                <motion.div
                  key={activeSlide}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className="h-full bg-white/60"
                />
              </div>
            </div>
          </div>
          {/* Laptop keyboard base */}
          <div className="relative">
            <div className="w-[108%] -ml-[4%] h-4 bg-gradient-to-b from-zinc-300 to-zinc-400 rounded-b-xl border-b-[3px] border-zinc-500 shadow-[0_6px_20px_rgba(0,0,0,0.3)] flex items-center justify-center">
              <div className="w-16 h-[3px] bg-zinc-500/40 rounded-full" />
            </div>
            {/* Laptop shadow foot */}
            <div className="w-[80%] mx-auto h-1 bg-black/20 blur-sm rounded-full mt-0.5" />
          </div>
        </div>
      </div>
      {/* ── Slide Text + Dots ── */}
      <div className="text-center space-y-4 z-10">
        {/* Animated title + description */}
        <div className="min-h-[68px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-1"
            >
              <h3 className="text-xl font-extrabold tracking-tight">
                {slides[activeSlide].title}
              </h3>
              <p className="text-white/65 text-xs max-w-[260px] leading-relaxed">
                {slides[activeSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Clickable pill-dots navigation */}
        <div className="flex items-center gap-2 justify-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`transition-all duration-300 cursor-pointer rounded-full ${
                activeSlide === index
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/35 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
