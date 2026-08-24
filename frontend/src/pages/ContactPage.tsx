import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="relative z-10 flex flex-col items-center w-full min-h-screen">
      <Header />
      
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-24 md:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-founder-card/80 backdrop-blur-md rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-founder-border p-8 md:p-12 transition-colors"
        >
          {isSubmitted ? (
            <div className="py-20 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Request Received!</h2>
              <p className="text-xl text-gray-600 dark:text-founder-textMuted">Thank you for your interest. Our team will be in touch with you shortly to schedule your demo.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Request a Demo</h1>
                <p className="text-lg text-gray-600 dark:text-founder-textMuted">Fill out the details below and our team will get back to you to schedule your personalized demo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      required
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-founder-dark/50 border border-gray-200 dark:border-founder-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent transition-colors outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      required
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-founder-dark/50 border border-gray-200 dark:border-founder-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent transition-colors outline-none"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What service do you need? *</label>
                  <select 
                    id="service"
                    required
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-founder-dark/50 border border-gray-200 dark:border-founder-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent transition-colors outline-none appearance-none"
                  >
                    <option value="" disabled selected>Select an option...</option>
                    <option value="full">Full OS Orchestration</option>
                    <option value="marketing">Marketing Automation</option>
                    <option value="hiring">Smart Hiring Pipelines</option>
                    <option value="custom">Custom Agent Integration</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Details / Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-founder-dark/50 border border-gray-200 dark:border-founder-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent transition-colors outline-none resize-none"
                    placeholder="Tell us about your startup and what you're looking to automate..."
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-founder-primary hover:bg-founder-primary/90 text-white font-bold py-5 rounded-xl text-lg transition-colors shadow-lg shadow-founder-primary/25"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
