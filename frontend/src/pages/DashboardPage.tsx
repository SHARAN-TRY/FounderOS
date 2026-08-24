import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  ClipboardList, 
  Bot, 
  GitBranch, 
  Cpu, 
  CheckSquare, 
  Play, 
  Activity, 
  FileText, 
  Link as LinkIcon, 
  Settings, 
  Plus, 
  Building2, 
  ChevronDown, 
  Search, 
  Bell, 
  Terminal, 
  AlertTriangle,
  User,
  Users,
  MessageSquare,
  CheckCircle2,
  Zap,
  Moon,
  Sun,
  Hexagon,
  LogOut,
  Send,
  Loader2,
  Briefcase,
  Megaphone,
  DollarSign,
  Scale
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../components/ThemeProvider';

export function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { tabId } = useParams();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState('Founder');
  const [userPicture, setUserPicture] = useState<string | null>(null);

  // Goals tab states
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalRisk, setNewGoalRisk] = useState('Low');
  const [newGoalDate, setNewGoalDate] = useState('');

  const [goals, setGoals] = useState<any[]>([]);

  // Sidebar tab states
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);

  // Tasks tab states
  const [taskInput, setTaskInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setAnalysisLogs] = useState<string[]>([]);
  const [, setSelectedTaskId] = useState<number | null>(null);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [isExecutingAgents, setIsExecutingAgents] = useState(false);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalDate) return;

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newGoalTitle,
          risk: newGoalRisk,
          target_date: newGoalDate
        }),
      });

      if (response.ok) {
        const newGoal = await response.json();
        // Since the backend might not return agents array initially, we map it.
        setGoals([...goals, { ...newGoal, agents: [], tasks: [] }]);
        setNewGoalTitle('');
        setNewGoalRisk('Low');
        setNewGoalDate('');
        setShowNewGoalModal(false);
      }
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || isAnalyzing) return;

    setActiveTab('CEO Agent');
    setIsAnalyzing(true);
    setAnalysisLogs([]);
    setSelectedTaskId(null);

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const logs = [
      "[CEO Agent] Parsing business objective...",
      "[CEO Agent] Identifying task dependencies...",
      "[CEO Agent] Mapping task to appropriate departments...",
      "[CEO Agent] Formulating agent delegation strategy...",
      "[CEO Agent] Tasks successfully delegated! Dispatching..."
    ];

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const taskRes = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskInput,
          date: dateStr,
          status: "running"
        })
      });

      if (!taskRes.ok) throw new Error("Failed to create task");
      const createdTask = await taskRes.json();
      
      // Simulate logs sequentially
      for (let i = 0; i < logs.length; i++) {
        await new Promise(r => setTimeout(r, 800));
        setAnalysisLogs(prev => [...prev, logs[i]]);
      }

      const analyzeRes = await fetch(`${apiUrl}/api/tasks/${createdTask.id}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (analyzeRes.ok) {
        const analyzedTask = await analyzeRes.json();
        setTasksList(prev => [analyzedTask, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTaskInput('');
      setIsAnalyzing(false);
      // Let it remain on the screen, or clear it if needed.
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth?mode=login');
        return;
      }
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
           navigate('/auth?mode=login');
           return;
        }

        if (res.ok) {
          const data = await res.json();
          // We map data to include agents arrays for the UI if missing
          setGoals(data.goals.map((g: any) => ({...g, agents: g.agents || ["CEO"], targetDate: g.target_date})));
          setTasksList(data.tasks);
          setLiveActivity(data.activities.map((a: any) => ({
            agent: a.agent_name,
            action: a.action,
            time: a.time,
            bg: a.bg_color,
            icon: <Bot size={14} className={a.icon_type === 'alert' ? 'text-amber-500' : 'text-[#8B5CF6]'} />
          })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchDashboardData();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.name) setUserName(user.name);
        if (user.picture) setUserPicture(user.picture);
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Tasks', icon: <ClipboardList size={18} /> },
    { 
      name: 'Agents', 
      isSection: true,
      subItems: [
        { name: 'CEO Agent', icon: <Briefcase size={16} /> },
        { name: 'Hiring Agent', icon: <Users size={16} /> },
        { name: 'Marketing Agent', icon: <Megaphone size={16} /> },
        { name: 'Finance Agent', icon: <DollarSign size={16} /> },
        { name: 'Legal Agent', icon: <Scale size={16} /> }
      ]
    },
    { name: 'Workflow', icon: <GitBranch size={18} /> },
    { name: 'Memory', icon: <Cpu size={18} /> },
    { name: 'Approvals', icon: <CheckSquare size={18} /> },
    { name: 'Executions', icon: <Play size={18} /> },
    { name: 'Monitoring', icon: <Activity size={18} /> },
    { name: 'Audit Logs', icon: <FileText size={18} /> },
    { name: 'Integrations', icon: <LinkIcon size={18} /> },
  ];

  const allNames = sidebarItems.reduce((acc: string[], item: any) => {
    if (item.name !== 'Agents') acc.push(item.name);
    if (item.subItems) item.subItems.forEach((sub: any) => acc.push(sub.name));
    return acc;
  }, []);

  const activeTabMatch = tabId ? allNames.find(n => n.toLowerCase().replace(/\s+/g, '-') === tabId) : undefined;
  const activeTab = activeTabMatch || 'Dashboard';
  
  const setActiveTab = (tabName: string) => {
    navigate(`/dashboard/${tabName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const metrics = [
    { title: "ACTIVE GOALS", value: goals.length.toString() },
    { title: "RUNNING TASKS", value: tasksList.filter(t => t.status === 'running').length.toString() },
    { title: "AI AGENTS WORKING", value: "5", activeDot: true },
    { title: "AWAITING APPROVAL", value: "3", highlightClass: "border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.1)]" },
    { title: "COMPLETED TODAY", value: tasksList.filter(t => t.status === 'completed').length.toString(), highlightClass: "border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.1)]" },
    { title: "AI EXECUTION COST", value: "₹4,850" }
  ];

  const teamProgress = [
    { name: "CEO", progress: 80, color: "bg-[#8B5CF6]" },
    { name: "Finance", progress: 75, color: "bg-[#00DF89]" },
    { name: "Marketing", progress: 55, color: "bg-[#3B82F6]" },
    { name: "Hiring", progress: 40, color: "bg-[#6366F1]" },
    { name: "Legal", progress: 90, color: "bg-gray-300 dark:bg-gray-400" }
  ];

  const liveActivityRender = liveActivity.length > 0 ? liveActivity : [
    { agent: "CEO Agent", action: "Waiting for tasks...", time: "Just now", icon: <User size={14} className="text-[#8B5CF6]" />, bg: "bg-[#8B5CF6]/10" }
  ];

  const workflowSteps = [
    { label: "Founder Goal", icon: <User size={18} /> },
    { label: "Task Planning", icon: <GitBranch size={18} /> },
    { label: "Agents Executing", icon: <Users size={18} />, active: true },
    { label: "Approval", icon: <CheckSquare size={18} /> },
    { label: "Feedback", icon: <MessageSquare size={18} /> }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-[#0B0813] text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#120E1E] border-r border-gray-200 dark:border-[#251B38] flex flex-col h-full shrink-0 relative">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-[#251B38]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-founder-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(136,51,255,0.4)]">
              <Hexagon size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Founder OS</h1>
              <p className="text-[10px] text-gray-500 dark:text-founder-textMuted uppercase font-semibold tracking-wider">AI workforce</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {sidebarItems.map((item) => {
            if (item.isSection && item.subItems) {
              return (
                <div key={item.name} className="pt-4 pb-1">
                  <button 
                    onClick={() => setIsAgentsOpen(!isAgentsOpen)}
                    className="w-full px-4 mb-2 flex items-center justify-between text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors group"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Bot size={14} />
                      {item.name}
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isAgentsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isAgentsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-0.5 overflow-hidden"
                      >
                        {item.subItems.map((sub) => {
                          const isSelected = activeTab === sub.name;
                          return (
                            <button
                              key={sub.name}
                              onClick={() => setActiveTab(sub.name)}
                              className={`flex w-full items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                                isSelected
                                  ? 'bg-[#00DF89]/10 text-[#00DF89] dark:bg-[#00DF89]/15'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C162E] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="w-5 flex justify-center opacity-70">{sub.icon}</div>
                              {sub.name}
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isSelected = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex w-full items-center gap-3.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[#00DF89]/10 text-[#00DF89] dark:bg-[#00DF89]/15'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C162E] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.icon && <div className="w-5 flex justify-center">{item.icon}</div>}
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Settings & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-[#251B38]/50 space-y-1">
          <button 
            onClick={() => setActiveTab('Settings')}
            className={`flex w-full items-center gap-3.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'Settings'
                ? 'bg-[#00DF89]/10 text-[#00DF89]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C162E] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Settings size={18} />
            Settings
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3.5 px-4 py-2.5 text-sm font-semibold rounded-xl text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/15 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-[#120E1E] border-b border-gray-200 dark:border-[#251B38] shrink-0 relative z-30">
          <div className="flex items-center gap-6">
            {/* Company Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
              <Building2 size={16} />
              <span>Acme Corp</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Global Search (⌘K)" 
                className="bg-gray-100 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-800 dark:text-white w-64 focus:outline-none focus:border-founder-primary transition-colors font-medium"
                disabled
              />
            </div>
          </div>

          {/* Right Header Panel */}
          <div className="flex items-center gap-4">
            {/* Dark Mode toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1C162E] rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1C162E] rounded-xl relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#8B5CF6] rounded-full ring-2 ring-white dark:ring-[#120E1E]" />
            </button>

            {/* Command / Terminal Toggle */}
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1C162E] rounded-xl transition-colors">
              <Terminal size={20} />
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="w-8 h-8 rounded-full bg-founder-primary/20 border border-founder-primary flex items-center justify-center font-bold text-founder-primary text-xs overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
                title="Profile Menu"
              >
                {userPicture ? (
                  <img src={userPicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(userName)
                )}
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-xl shadow-xl z-20 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-[#251B38]/50">
                        <p className="text-xs text-gray-500 dark:text-founder-textMuted font-bold">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('Settings'); setIsProfileOpen(false); }} 
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1C162E] transition-colors"
                      >
                        <Settings size={16} /> Account Settings
                      </button>
                      <button 
                        onClick={() => navigate('/')} 
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#1C162E] border-t border-gray-100 dark:border-[#251B38]/50 mt-1 transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Panels Scroll Area */}
        <main className="flex-grow overflow-y-auto p-8 space-y-8 bg-gray-50 dark:bg-[#0B0813] transition-colors duration-300">
          
          {/* Dashboard Panel */}
          {activeTab === 'Dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Welcome Dashboard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Good morning, {userName}</h2>
                  <p className="text-gray-500 dark:text-founder-textMuted text-sm font-medium mt-1">Your AI workforce is working across your business.</p>
                </div>
                <button 
                  onClick={() => setShowNewGoalModal(true)}
                  className="flex items-center gap-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm self-start"
                >
                  <Plus size={16} /> New Goal
                </button>
              </div>

              {/* Metric Cards Horizontal Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.map((metric, idx) => (
                  <div 
                    key={idx}
                    className={`bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-xl p-4 transition-colors flex flex-col justify-between ${metric.highlightClass || ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-founder-textMuted uppercase">{metric.title}</span>
                      {metric.activeDot && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DF89] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00DF89]"></span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl font-extrabold tracking-tight mt-3">{metric.value}</h3>
                  </div>
                ))}
              </div>

              {/* Main 2-Column Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (featured goal + system workflow) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Featured Goal Card */}
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-founder-textMuted uppercase tracking-wider">FEATURED GOAL</span>
                        <h3 className="text-2xl font-bold tracking-tight mt-1">Launch my startup in 30 days</h3>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 text-xs font-semibold">
                        <AlertTriangle size={14} />
                        <span>Risk: Medium</span>
                      </div>
                    </div>

                    {/* Progress bar container */}
                    <div className="mt-8 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-500 dark:text-founder-textMuted">Overall Progress</span>
                        <span className="text-[#00DF89]">64%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-[#1C162E] border border-gray-200 dark:border-[#251B38] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00DF89] rounded-full" style={{ width: '64%' }}></div>
                      </div>
                      <div className="flex justify-end text-xs font-bold text-gray-400 dark:text-founder-textMuted mt-1">
                        <span>18/32 tasks completed</span>
                      </div>
                    </div>
                  </div>

                  {/* System Workflow Card */}
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-8">System Workflow</h3>
                    
                    {/* Stepper workflow path */}
                    <div className="relative flex items-center justify-between max-w-2xl mx-auto py-4">
                      {/* Dotted connecting line */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] border-t-2 border-dashed border-gray-300 dark:border-[#2D234A] -z-0"></div>
                      
                      {workflowSteps.map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            step.active 
                              ? 'bg-[#00DF89]/10 border-[#00DF89] text-[#00DF89] shadow-[0_0_15px_rgba(0,223,137,0.2)]'
                              : 'bg-white dark:bg-[#120E1E] border-gray-300 dark:border-[#2D234A] text-gray-500 dark:text-founder-textMuted'
                          }`}>
                            {step.icon}
                          </div>
                          <span className={`text-xs font-semibold mt-3 ${step.active ? 'text-[#00DF89]' : 'text-gray-500 dark:text-founder-textMuted'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column (AI team progress + activity log) */}
                <div className="space-y-6">
                  
                  {/* AI Team Progress Card */}
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Users size={18} className="text-gray-400" />
                      <h3 className="text-lg font-bold">AI Team Progress</h3>
                    </div>

                    <div className="space-y-4">
                      {teamProgress.map((team, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-700 dark:text-gray-300">{team.name}</span>
                            <span className="text-gray-500 dark:text-founder-textMuted">{team.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-[#1C162E] rounded-full overflow-hidden">
                            <div className={`h-full ${team.color} rounded-full`} style={{ width: `${team.progress}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live AI Activity Card */}
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">Live AI Activity</h3>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DF89] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00DF89]"></span>
                      </span>
                    </div>

                    {/* Timeline flow */}
                    <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200 dark:before:bg-[#1D162E]">
                      {liveActivityRender.map((activity, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 dark:border-[#251B38] ${activity.bg} shrink-0 z-10 bg-white dark:bg-[#120E1E]`}>
                            {activity.icon}
                          </div>
                          <div className="space-y-0.5 mt-0.5">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              <span className="text-gray-500 dark:text-founder-textMuted mr-1">{activity.agent}</span>
                              {activity.action}
                            </p>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-founder-textMuted">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* Goals Panel */}
          {activeTab === 'Goals' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Active Goals</h2>
                  <p className="text-sm text-gray-500 dark:text-founder-textMuted mt-1">Track business goals delegated to your AI workforce.</p>
                </div>
                <button 
                  onClick={() => setShowNewGoalModal(true)}
                  className="flex items-center gap-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm"
                >
                  <Plus size={16} /> New Goal
                </button>
              </div>

              {/* Goals list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => {
                  const isExpanded = expandedGoalId === goal.id;
                  return (
                    <div 
                      key={goal.id} 
                      className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 transition-all hover:border-[#2D234A] cursor-pointer"
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white max-w-[70%]">{goal.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          goal.risk === 'High' 
                            ? 'bg-red-500/10 border border-red-500/30 text-red-500' 
                            : goal.risk === 'Medium' 
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500' 
                              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                        }`}>
                          Risk: {goal.risk}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-founder-textMuted">
                        <span>Target: <strong className="text-gray-700 dark:text-gray-200">{goal.targetDate}</strong></span>
                        <span>{goal.completedTasks}/{goal.totalTasks} Tasks</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="w-full h-2 bg-gray-100 dark:bg-[#1C162E] border border-gray-200 dark:border-[#251B38] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              goal.progress >= 75 
                                ? 'bg-[#00DF89]' 
                                : goal.progress >= 40 
                                  ? 'bg-[#8B5CF6]' 
                                  : 'bg-[#3B82F6]'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-end text-[10px] font-bold text-[#00DF89]">
                          {goal.progress}% completed
                        </div>
                      </div>

                      {/* Active Agents Icons */}
                      <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 dark:border-[#251B38]/30 pt-4">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-founder-textMuted mr-1">DELEGATED AGENTS:</span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {goal.agents.map((agent: string, i: number) => (
                            <div 
                              key={i} 
                              className="w-6 h-6 rounded-full bg-founder-primary/20 border border-founder-primary/40 flex items-center justify-center font-extrabold text-[9px] text-founder-primary"
                              title={`${agent} Agent`}
                            >
                              {agent.slice(0, 2).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expandable sub-tasks details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 border-t border-gray-100 dark:border-[#251B38]/30 pt-4 space-y-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="text-xs font-bold text-gray-400 dark:text-founder-textMuted">GOAL EXECUTION TASKS</p>
                            <div className="space-y-2">
                              {(goal.tasks || []).map((task: any) => (
                                <div 
                                  key={task.id} 
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/50 dark:bg-[#130B24]/40 border border-gray-100 dark:border-[#251B38]/30 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      task.status === 'completed' 
                                        ? 'bg-[#00DF89]' 
                                        : task.status === 'running' 
                                          ? 'bg-[#3B82F6] animate-pulse' 
                                          : 'bg-gray-400'
                                    }`} />
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{task.title || task.name}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded bg-founder-primary/10 text-founder-primary text-[9px] font-bold">
                                    {task.title || task.name} 
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tasks Panel */}
          {activeTab === 'Tasks' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Please enter the task</h2>
              </div>

              <div className="flex flex-col gap-10 w-full mt-8">
                {/* Top side: Task submission & Terminal Analysis */}
                <div className="w-full space-y-6">
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-left">Delegate Task</h3>
                    <form onSubmit={handleTaskSubmit} className="space-y-4 w-full flex flex-col">
                      <div className="space-y-1.5 w-full text-left">
                        <label htmlFor="taskText" className="block text-xs font-semibold text-gray-400 dark:text-founder-textMuted uppercase tracking-wider text-left">Enter a task</label>
                        <textarea 
                          id="taskText" 
                          rows={4}
                          value={taskInput}
                          onChange={(e) => setTaskInput(e.target.value)}
                          disabled={isAnalyzing}
                          className="w-full px-4 py-3 bg-gray-50/50 dark:bg-founder-dark/40 border border-gray-200 dark:border-founder-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent outline-none transition-colors resize-none text-left"
                          placeholder="e.g., We need to hire a frontend engineer, define compensation budget rules, and review legal SaaS contracts..."
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={isAnalyzing || !taskInput.trim()}
                        className="w-auto px-8 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-400 disabled:dark:bg-[#1C162E] disabled:text-gray-400 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#8B5CF6]/20 mx-auto"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            CEO Analyzing...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Launch CEO Analysis
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CEO Agent Panel */}
          {activeTab === 'CEO Agent' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 pb-12"
            >
              <div className="flex flex-col gap-10 w-full mt-4">
                
                {tasksList.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-16 border border-dashed border-gray-200 dark:border-[#251B38] rounded-2xl bg-white/50 dark:bg-[#120E1E]/50 text-center mt-8"
                  >
                    <div className="w-16 h-16 bg-founder-primary/20 text-founder-primary rounded-full flex items-center justify-center mb-6">
                      <Briefcase size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">CEO Agent is on standby</h3>
                    <p className="text-gray-500 dark:text-founder-textMuted max-w-md mx-auto mb-6">
                      Your CEO Agent is waiting for instructions. Head over to the Tasks tab to delegate a new objective, and watch the AI workforce execute it.
                    </p>
                    <button 
                      onClick={() => setActiveTab('Tasks')}
                      className="px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors shadow-lg shadow-[#8B5CF6]/20"
                    >
                      <Plus size={16} />
                      Delegate New Task
                    </button>
                  </motion.div>
                ) : (
                  (() => {
                    const latestTask = tasksList[0];
                    const getAgentConfig = (agentName: string) => {
                      if (agentName.includes('Hiring')) return { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-500', fill: '#10B981' };
                      if (agentName.includes('Marketing')) return { icon: Megaphone, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30', badge: 'bg-[#8B5CF6]/20 text-[#8B5CF6]', fill: '#8B5CF6' };
                      if (agentName.includes('Finance')) return { icon: DollarSign, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', badge: 'bg-[#3B82F6]/20 text-[#3B82F6]', fill: '#3B82F6' };
                      if (agentName.includes('Legal')) return { icon: Scale, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-500', fill: '#F59E0B' };
                      return { icon: Bot, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30', badge: 'bg-gray-400/20 text-gray-400', fill: '#9CA3AF' };
                    };

                    return (
                      <div className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">CEO Agent Delegations</h2>
                            <p className="text-gray-500 dark:text-founder-textMuted text-sm mt-1">CEO Agent is analyzing your request and delegating to specialized agents</p>
                          </div>
                          <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-[10px] font-bold border border-emerald-500/30 flex items-center gap-2 self-start sm:self-auto">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            RUNNING
                          </div>
                        </div>

                        {/* Founder Request */}
                        <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shadow-sm">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 bg-founder-primary/10 rounded-full flex items-center justify-center text-founder-primary shrink-0 border border-founder-primary/20">
                               <User size={24} />
                             </div>
                             <div>
                               <p className="text-[10px] text-gray-500 dark:text-founder-textMuted font-bold uppercase tracking-widest mb-1">Founder Request</p>
                               <p className="text-gray-900 dark:text-white text-lg font-medium leading-tight">{latestTask.title}</p>
                               <p className="text-[10px] text-gray-400 dark:text-founder-textMuted mt-1.5">Created on: {latestTask.date} • {new Date(latestTask.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             </div>
                          </div>
                          <button className="border border-gray-200 dark:border-[#251B38] bg-transparent hover:bg-gray-50 dark:hover:bg-[#1C162E] text-gray-600 dark:text-gray-300 px-5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto">
                            View Details
                          </button>
                        </div>

                        {/* Analysis & Decision */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                          <div className="lg:col-span-2 bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 shadow-sm">
                             <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2 mb-5 text-sm">
                               <Activity size={16} className="text-amber-500" /> CEO Agent Analysis
                             </h3>
                             <ul className="space-y-3.5">
                               <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                 <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Understanding the objective of the request
                               </li>
                               <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                 <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Breaking down into key business requirements
                               </li>
                               <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                 <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Identifying required departments and expertise
                               </li>
                               <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                 <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Delegating tasks to specialized agents
                                 {latestTask.status === 'running' && <Loader2 size={14} className="animate-spin text-founder-primary ml-1" />}
                               </li>
                             </ul>
                          </div>
                          <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                            <h3 className="font-bold mb-5 text-sm text-founder-primary">CEO Agent Decision</h3>
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-founder-primary/10 rounded-2xl flex items-center justify-center text-founder-primary shrink-0 border border-founder-primary/20">
                                <Cpu size={24} />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                To achieve this objective, I will coordinate with the following departments and agents.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Flowchart */}
                        <div className="mb-10 w-full overflow-x-auto pb-4">
                          <div className="min-w-[900px]">
                            <h3 className="text-center text-founder-primary font-bold mb-6 text-sm">CEO Agent Delegation Flow</h3>
                            
                            {/* Root */}
                            <div className="flex justify-center relative">
                              <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-founder-primary/50 rounded-2xl p-4 flex items-center gap-4 w-72 z-10 relative shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                                 <div className="w-10 h-10 bg-founder-primary/10 rounded-full flex items-center justify-center text-founder-primary border border-founder-primary/20">
                                   <Bot size={20} />
                                 </div>
                                 <div>
                                   <p className="font-bold text-gray-900 dark:text-white">CEO Agent</p>
                                   <p className="text-[10px] text-gray-500 dark:text-founder-textMuted uppercase tracking-wider mt-0.5">Strategic Analysis & Delegation</p>
                                 </div>
                              </div>
                              {/* vertical line down */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-6 bg-founder-primary/40"></div>
                            </div>
                            
                            {/* Branches */}
                            <div className="relative mt-6 px-4">
                              {/* Horizontal Line spanning the grid, stopping at the middle of the first and last columns */}
                              <div className="absolute top-0 left-[12.5%] right-[12.5%] h-[2px] bg-founder-primary/40"></div>
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 dark:bg-[#0B0813] px-3 py-1 text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#251B38] rounded-full z-10 uppercase tracking-widest">Delegates to</div>
                              
                              <div className="grid grid-cols-4 gap-6 pt-6">
                                 {latestTask.delegations.map((del: any, idx: number) => {
                                   const config = getAgentConfig(del.agent);
                                   const Icon = config.icon;
                                   return (
                                     <div key={idx} className="relative">
                                       {/* Vertical line from horizontal line to card */}
                                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[2px] h-6" style={{ backgroundColor: config.fill + '60' }}></div>
                                       {/* Arrow head */}
                                       <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border-b-2 border-r-2 rotate-45" style={{ borderColor: config.fill + '60' }}></div>

                                       <div className={`bg-white dark:bg-[#120E1E] border rounded-2xl p-5 h-full flex flex-col transition-colors shadow-sm`} style={{ borderColor: config.fill + '40' }}>
                                         <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-[#251B38]/50 pb-4">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${config.bg} ${config.color}`} style={{ borderColor: config.fill + '40' }}>
                                             <Icon size={18} />
                                           </div>
                                           <div>
                                             <p className="font-bold text-gray-900 dark:text-white text-sm">{del.agent} Agent</p>
                                             <p className="text-[10px] text-gray-500 dark:text-founder-textMuted">{
                                               del.agent.includes('Hiring') ? 'Talent & Recruitment' :
                                               del.agent.includes('Marketing') ? 'Growth & Outreach' :
                                               del.agent.includes('Finance') ? 'Budget & Financial Planning' :
                                               'Compliance & Legal Review'
                                             }</p>
                                           </div>
                                         </div>
                                         <div className="flex-1 space-y-4">
                                           <div>
                                             <p className="text-[10px] font-bold text-gray-400 dark:text-founder-textMuted uppercase mb-1.5">Order / Task</p>
                                             <div className="flex items-start gap-2">
                                               <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: config.fill }}></span>
                                               <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{del.task_description || del.task}</p>
                                             </div>
                                           </div>
                                           <div>
                                             <p className="text-[10px] font-bold text-gray-400 dark:text-founder-textMuted uppercase mb-1.5">Priority</p>
                                             <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                                               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.fill }}></span>
                                               {del.agent.includes('Marketing') ? 'High' : 'Medium'}
                                             </div>
                                           </div>
                                         </div>
                                         <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#251B38]/50 flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${config.badge} flex items-center gap-1.5`}>
                                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.fill }}></span>
                                              IN PROGRESS
                                            </span>
                                         </div>
                                       </div>
                                     </div>
                                   );
                                 })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 shadow-sm">
                            <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2 mb-5 text-sm">
                               <Zap size={16} className="text-founder-primary" /> Real-time CEO Agent Activity
                            </h3>
                            <div className="space-y-3 font-mono text-xs">
                               <div className="flex gap-6">
                                 <span className="text-gray-400 dark:text-founder-textMuted w-24">10:45:12 AM</span>
                                 <span className="text-gray-700 dark:text-gray-300">Request received from Founder</span>
                               </div>
                               <div className="flex gap-6">
                                 <span className="text-gray-400 dark:text-founder-textMuted w-24">10:45:15 AM</span>
                                 <span className="text-gray-700 dark:text-gray-300">Analyzing objective and breaking down requirements</span>
                               </div>
                               <div className="flex gap-6">
                                 <span className="text-gray-400 dark:text-founder-textMuted w-24">10:45:18 AM</span>
                                 <span className="text-gray-700 dark:text-gray-300">Identified 4 departments required</span>
                               </div>
                               <div className="flex gap-6">
                                 <span className="text-gray-400 dark:text-founder-textMuted w-24">10:45:22 AM</span>
                                 <span className="text-gray-700 dark:text-gray-300">Delegating tasks to specialized agents</span>
                               </div>
                               <div className="flex gap-6">
                                 <span className="text-gray-400 dark:text-founder-textMuted w-24">10:45:24 AM</span>
                                 <span className="text-gray-700 dark:text-gray-300">All agents notified and tasks initiated</span>
                               </div>
                            </div>
                          </div>
                          <div className="bg-[#120E1E] border border-[#251B38] rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-sm">
                             {/* Subtle glow background */}
                             <div className="absolute inset-0 bg-emerald-500/5 z-0 pointer-events-none"></div>
                             <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center mb-3 z-10 relative bg-[#120E1E]">
                               <CheckCircle2 size={20} className="text-emerald-500" />
                             </div>
                             <h4 className="text-emerald-500 font-bold text-sm mb-2 z-10 relative">Delegation Initiated Successfully</h4>
                             <p className="text-[11px] text-gray-400 leading-relaxed mb-5 z-10 relative max-w-[220px]">
                               All agents have received their tasks and are now working on your request.
                             </p>
                             <button className="bg-[#2D234A] hover:bg-[#3B2D60] border border-[#3B2D60] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors z-10 relative shadow-sm">
                               View Progress
                             </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </motion.div>
          )}

          {/* Sub-Agent Panels (Hiring, Marketing, Finance, Legal) */}
          {['Hiring Agent', 'Marketing Agent', 'Finance Agent', 'Legal Agent'].includes(activeTab) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{activeTab} Workspace</h2>
                  <p className="text-gray-500 dark:text-founder-textMuted text-sm font-medium mt-1">Manage and execute delegated tasks for this department.</p>
                </div>
                <button 
                  onClick={() => {
                    setIsExecutingAgents(true);
                    setTimeout(() => setIsExecutingAgents(false), 3000);
                  }}
                  disabled={isExecutingAgents}
                  className="flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 px-6 rounded-xl transition-all text-sm shadow-lg shadow-[#8B5CF6]/20 disabled:bg-gray-400"
                >
                  {isExecutingAgents ? (
                    <><Loader2 className="animate-spin" size={16} /> Executing...</>
                  ) : (
                    <><Play size={16} /> Execute All Tasks</>
                  )}
                </button>
              </div>

              {/* Grid of agent task cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 flex flex-col justify-between hover:border-[#2D234A] transition-colors min-h-[200px]">
                     <div>
                       <div className="flex justify-between items-start mb-3">
                         <h3 className="font-bold text-gray-900 dark:text-white">Workflow Queue #{i}</h3>
                         <span className="bg-gray-100 dark:bg-[#1C162E] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#2D234A] text-[10px] font-bold px-2 py-0.5 rounded">PENDING</span>
                       </div>
                       <p className="text-xs text-gray-500 dark:text-founder-textMuted leading-relaxed">
                         Awaiting execution command from the {activeTab.split(' ')[0]} pipeline. This workflow includes data processing, API synchronization, and final output generation.
                       </p>
                     </div>
                     <div className="flex gap-3 mt-6">
                       <button className="flex-1 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-[#251B38] px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1C162E] transition-colors text-center">
                         View Details
                       </button>
                       <button className="flex-1 text-xs font-bold text-[#00DF89] bg-[#00DF89]/10 border border-[#00DF89]/20 px-4 py-2.5 rounded-lg hover:bg-[#00DF89]/20 transition-colors text-center">
                         Start Task
                       </button>
                     </div>
                   </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Placeholder for other sections */}
          {activeTab !== 'Dashboard' && activeTab !== 'Goals' && activeTab !== 'Tasks' && activeTab !== 'CEO Agent' && !['Hiring Agent', 'Marketing Agent', 'Finance Agent', 'Legal Agent'].includes(activeTab) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-12 text-center shadow-sm"
            >
              <Bot className="mx-auto text-founder-primary/40 mb-4 animate-bounce" size={48} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{activeTab} Section</h3>
              <p className="text-gray-500 dark:text-founder-textMuted max-w-sm mx-auto">This section is currently compiling and syncing with the workspace core system. Check back shortly!</p>
            </motion.div>
          )}

        </main>
      </div>

      {/* New Goal Modal */}
      <AnimatePresence>
        {showNewGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewGoalModal(false)}
              className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 z-10 shadow-xl transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Launch New Goal</h3>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label htmlFor="goalTitle" className="block text-xs font-semibold text-gray-500 dark:text-founder-textMuted mb-1">GOAL DESCRIPTION</label>
                  <input 
                    type="text" 
                    id="goalTitle"
                    required
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-founder-dark/50 border border-gray-200 dark:border-founder-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent transition-colors outline-none text-sm"
                    placeholder="e.g., Automate customer support pipeline"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="goalRisk" className="block text-xs font-semibold text-gray-500 dark:text-founder-textMuted mb-1">RISK PROFILE</label>
                    <select 
                      id="goalRisk"
                      value={newGoalRisk}
                      onChange={(e) => setNewGoalRisk(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-founder-dark/50 border border-gray-200 dark:border-founder-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent transition-colors outline-none text-sm"
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="goalDate" className="block text-xs font-semibold text-gray-500 dark:text-founder-textMuted mb-1">TARGET DATE</label>
                    <input 
                      type="text" 
                      id="goalDate"
                      required
                      value={newGoalDate}
                      onChange={(e) => setNewGoalDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-founder-dark/50 border border-gray-200 dark:border-founder-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent transition-colors outline-none text-sm"
                      placeholder="e.g., Sept 30, 2026"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowNewGoalModal(false)}
                    className="flex-1 bg-gray-100 dark:bg-founder-dark hover:bg-gray-200 dark:hover:bg-founder-border text-gray-700 dark:text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-founder-primary hover:bg-founder-primary/90 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Deploy Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
