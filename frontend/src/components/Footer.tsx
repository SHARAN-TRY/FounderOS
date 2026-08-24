import { Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-founder-darkest border-t border-gray-200 dark:border-founder-border transition-colors duration-500 relative z-20">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        
        {/* Top CTA Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 pb-16 border-b border-gray-200 dark:border-founder-border/50">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Request info or schedule a demo
            </h2>
            <p className="text-gray-600 dark:text-founder-textMuted text-lg transition-colors">
              See how Founder OS can transform your startup scaling.
            </p>
          </div>
          <Link to="/contact" className="flex-shrink-0 px-8 py-4 rounded-full bg-founder-primary text-white font-semibold hover:bg-founder-primary/90 transition-colors shadow-lg shadow-founder-primary/25">
            Contact Us
          </Link>
        </div>

        {/* Bottom Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand & Copyright */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white transition-colors">
              <Hexagon className="w-8 h-8 text-founder-primary" fill="currentColor" fillOpacity={0.2} />
              <span className="text-2xl font-bold tracking-tight">Founder OS</span>
            </div>
            <p className="text-gray-500 dark:text-founder-textMuted text-sm transition-colors">
              © 2026 Founder OS. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6 transition-colors">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-600 dark:text-founder-textMuted hover:text-founder-primary dark:hover:text-founder-highlight transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-600 dark:text-founder-textMuted hover:text-founder-primary dark:hover:text-founder-highlight transition-colors">Agent Guide</a></li>
              <li><a href="#" className="text-gray-600 dark:text-founder-textMuted hover:text-founder-primary dark:hover:text-founder-highlight transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6 transition-colors">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-600 dark:text-founder-textMuted hover:text-founder-primary dark:hover:text-founder-highlight transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 dark:text-founder-textMuted hover:text-founder-primary dark:hover:text-founder-highlight transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 dark:text-founder-textMuted hover:text-founder-primary dark:hover:text-founder-highlight transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
