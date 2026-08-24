import { useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(v) {
          if (ref.current) {
            ref.current.textContent = prefix + v.toFixed(decimals) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{decimals > 0 ? '.' + '0'.repeat(decimals) : ''}{suffix}</span>;
}

export function Stats() {
  const stats = [
    { value: 500, prefix: "", suffix: "+", decimals: 0, label: "AI-NATIVE STARTUPS" },
    { value: 120, prefix: "₹", suffix: "M+", decimals: 0, label: "EXECUTION COSTS SAVED" },
    { value: 2.4, prefix: "", suffix: "M", decimals: 1, label: "TASKS AUTOMATED" },
    { value: 99.9, prefix: "", suffix: "%", decimals: 1, label: "UPTIME" },
  ];

  return (
    <section className="w-full mt-32 border-t border-gray-200 dark:border-founder-border/50 bg-white/50 dark:bg-founder-darkest/40 relative z-10 transition-colors duration-500">
       {/* Background gradient from top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-founder-primary/30 to-transparent transition-colors"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200 dark:divide-founder-border/30">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center justify-center p-4"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight transition-colors">
                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
              </h2>
              <p className="text-xs tracking-[0.15em] font-bold text-gray-500 dark:text-founder-textMuted uppercase transition-colors">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
