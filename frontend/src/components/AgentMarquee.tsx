import { Cpu, CircleDollarSign, Megaphone, Users, Scale, Briefcase } from 'lucide-react';

export function AgentMarquee() {
  const baseAgents = [
    { name: "CEO Agent", icon: <Cpu size={28} /> },
    { name: "Finance Agent", icon: <CircleDollarSign size={28} /> },
    { name: "Marketing Agent", icon: <Megaphone size={28} /> },
    { name: "Hiring Agent", icon: <Users size={28} /> },
    { name: "Legal Agent", icon: <Scale size={28} /> },
    { name: "Sales Agent", icon: <Briefcase size={28} /> },
  ];

  // We duplicate the list 4 times so the track is very wide, 
  // and translateX(-50%) will shift it exactly 2 full sets, creating a perfect seamless loop.
  const agents = [...baseAgents, ...baseAgents, ...baseAgents, ...baseAgents];

  return (
    <div id="agents" className="w-full relative py-8 mt-12 overflow-hidden bg-transparent transition-colors duration-500 z-20">
      <style>
        {`
          @keyframes infinite-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .custom-marquee {
            animation: infinite-scroll 30s linear infinite;
          }
        `}
      </style>
      
      {/* Left/Right Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-r from-gray-50 dark:from-[#0A0314] to-transparent z-10 pointer-events-none transition-colors"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-l from-gray-50 dark:from-[#0A0314] to-transparent z-10 pointer-events-none transition-colors"></div>

      <div className="text-center mb-8 relative z-20">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 dark:text-founder-textMuted transition-colors">
          Powered by an ecosystem of autonomous agents
        </p>
      </div>

      <div className="flex w-max custom-marquee pt-2 pb-6">
        {agents.map((agent, i) => (
          <div 
            key={i} 
            className="flex items-center gap-4 mx-6 px-10 py-6 rounded-full border border-gray-200 dark:border-founder-border bg-white/80 dark:bg-founder-card/80 shadow-sm dark:shadow-[0_0_15px_rgba(10,5,20,0.5)] backdrop-blur-sm transition-all duration-300 cursor-default hover:-translate-y-2 hover:border-founder-primary/50 hover:shadow-[0_5px_20px_rgba(136,51,255,0.3)]"
          >
            <div className="text-founder-primary dark:text-founder-highlight">
              {agent.icon}
            </div>
            <span className="font-bold text-xl text-gray-800 dark:text-white whitespace-nowrap">
              {agent.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
