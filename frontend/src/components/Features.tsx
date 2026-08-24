import { Cpu, CircleDollarSign, Megaphone, Users, Scale, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "Goal Translation",
    description: "Takes your high-level business objectives and automatically breaks them down into an actionable, step-by-step roadmap.",
    icon: <Cpu className="w-6 h-6" />
  },
  {
    title: "Financial Planning",
    description: "Manages budgets, tracks expenses, and estimates ROI for your initiatives before a single dollar is spent.",
    icon: <CircleDollarSign className="w-6 h-6" />
  },
  {
    title: "Automated Marketing",
    description: "Conducts market research, defines target audiences, and runs continuous outreach campaigns 24/7.",
    icon: <Megaphone className="w-6 h-6" />
  },
  {
    title: "Talent Sourcing",
    description: "Generates job descriptions, screens candidates, and creates intelligent interview workflows for rapid team expansion.",
    icon: <Users className="w-6 h-6" />
  },
  {
    title: "Risk Mitigation",
    description: "Validates contracts, checks company policies, and ensures compliance before executing critical business actions.",
    icon: <Scale className="w-6 h-6" />
  },
  {
    title: "Human-in-the-Loop",
    description: "You remain in complete control. Important and high-risk decisions are always flagged for your final approval.",
    icon: <ShieldCheck className="w-6 h-6" />
  }
];

export function Features() {
  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-4 py-24 relative z-10">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors"
        >
          Everything a Founder Needs
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-founder-textMuted max-w-2xl mx-auto transition-colors"
        >
          Everything you need to launch and scale your startup on autopilot.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative rounded-2xl border border-gray-200 dark:border-founder-border bg-white/70 dark:bg-founder-card/80 p-8 shadow-sm dark:shadow-[0_10px_30px_rgba(10,5,20,0.5)] backdrop-blur-xl overflow-hidden hover:-translate-y-2 hover:border-founder-primary/80 dark:hover:border-founder-primary hover:shadow-[0_0_40px_rgba(136,51,255,0.5)] dark:hover:shadow-[0_0_60px_rgba(136,51,255,0.8)] transition-all duration-300"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-founder-primary/0 via-founder-primary/5 dark:via-founder-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="w-12 h-12 rounded-xl bg-founder-primary/10 text-founder-primary dark:text-founder-highlight flex items-center justify-center mb-6 shadow-inner transition-colors">
              {feature.icon}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 relative z-10 transition-colors">
              {feature.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-founder-textMuted leading-relaxed relative z-10 transition-colors">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
