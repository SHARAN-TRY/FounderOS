import { Hexagon, Moon, Sun } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider';

export function Header() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for HomePage to mount
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-founder-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(136,51,255,0.4)]">
          <Hexagon size={20} fill="currentColor" className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Founder OS</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-founder-textMuted">
        <button onClick={() => scrollToSection('features')} className="hover:text-founder-primary dark:hover:text-white transition-colors">Features</button>
        <button onClick={() => scrollToSection('agents')} className="hover:text-founder-primary dark:hover:text-white transition-colors">Agents</button>
        <button onClick={() => scrollToSection('faq')} className="hover:text-founder-primary dark:hover:text-white transition-colors">FAQ</button>
      </nav>

      <div className="flex items-center gap-6 text-sm font-medium">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-founder-border text-gray-600 dark:text-founder-textMuted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link to="/auth?mode=login" className="text-gray-600 dark:text-founder-textMuted hover:text-founder-primary dark:hover:text-white transition-colors">Log In</Link>
        <Link to="/auth?mode=signup" className="bg-founder-primary hover:bg-founder-primary/90 dark:bg-founder-highlight dark:hover:bg-white text-white dark:text-founder-darkest px-5 py-2 rounded-full font-semibold transition-colors shadow-[0_0_15px_rgba(184,146,255,0.3)]">
          Sign Up
        </Link>
      </div>
    </header>
  );
}
