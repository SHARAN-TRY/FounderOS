import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What exactly is Founder OS?",
    answer: "Founder OS is an AI-powered operating system that acts as your virtual C-suite. You simply input a high-level business goal, and our ecosystem of specialized AI agents (Marketing, Finance, Hiring, etc.) collaborate to break it down, plan, and execute the work autonomously."
  },
  {
    question: "Do I lose control over my business decisions?",
    answer: "Not at all. Founder OS includes a robust Human-in-the-Loop system. While the agents can execute routine tasks autonomously, any high-stakes decisions, contract approvals, or significant budget allocations are always flagged for your final review and authorization."
  },
  {
    question: "How long does it take to integrate with my existing tools?",
    answer: "Our platform is designed to be plug-and-play. Founder OS natively integrates with most major CRMs, ad networks, and project management tools in minutes, allowing your AI agents to start working immediately without complex migrations."
  },
  {
    question: "What happens if the AI agents make a mistake?",
    answer: "The system is built with cross-agent validation. For example, before the Marketing Agent launches a campaign, the Legal Agent checks the copy for compliance risks, and the Finance Agent verifies the budget. This multi-layered validation drastically reduces the margin of error."
  },
  {
    question: "Is my company's data safe and private?",
    answer: "Security is our top priority. All data processed by Founder OS is enterprise-grade encrypted. We use isolated instances for each client, meaning your proprietary business data is never shared or used to train public AI models."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full max-w-4xl mx-auto py-24 px-4 relative z-20">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-founder-textMuted transition-colors"
        >
          Everything you need to know about scaling with Founder OS.
        </motion.p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-founder-border rounded-2xl bg-white/50 dark:bg-founder-card/50 backdrop-blur-sm overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className="font-semibold text-lg text-gray-900 dark:text-white transition-colors">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-500 dark:text-founder-textMuted flex-shrink-0 ml-4"
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 text-gray-600 dark:text-founder-textMuted leading-relaxed transition-colors">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
