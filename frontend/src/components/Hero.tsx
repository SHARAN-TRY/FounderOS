import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 relative z-10 w-full max-w-7xl mx-auto min-h-[calc(100vh-100px)] pb-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-hero-glow rounded-full -z-10 pointer-events-none opacity-50 dark:opacity-100 transition-opacity duration-500"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 dark:border-founder-border bg-white/50 dark:bg-founder-dark/50 backdrop-blur-sm text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-8 shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
        System Online
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight mb-6"
      >
        The AI Operating System <br /> for Founders
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-600 dark:text-founder-textMuted max-w-2xl mb-10 leading-relaxed font-medium"
      >
        Turn high-level goals into coordinated execution with your autonomous AI workforce. Don't just chat with AI—deploy an orchestrated team that works while you sleep.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <Link to="/auth?mode=login" className="flex items-center gap-2 bg-founder-primary hover:bg-founder-primary/90 dark:bg-founder-highlight dark:hover:bg-white text-white dark:text-founder-darkest px-6 py-3 rounded-full font-bold transition-colors shadow-[0_0_20px_rgba(184,146,255,0.4)]">
          Sign In <ArrowRight size={18} />
        </Link>
        <Link to="/contact" className="flex items-center gap-2 bg-white/80 dark:bg-founder-dark/80 hover:bg-gray-100 dark:hover:bg-founder-border/80 border border-gray-300 dark:border-founder-border text-gray-900 dark:text-white px-6 py-3 rounded-full font-semibold transition-colors backdrop-blur-sm">
          <Play size={18} /> Request a Demo
        </Link>
      </motion.div>
    </section>
  );
}
