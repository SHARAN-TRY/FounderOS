import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { AgentMarquee } from '../components/AgentMarquee';
import { Features } from '../components/Features';
import { Stats } from '../components/Stats';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <div className="relative z-10 flex flex-col items-center w-full">
      <Header />
      <Hero />
      <Features />
      <AgentMarquee />
      <Stats />
      <FAQ />
      <Footer />
    </div>
  );
}
