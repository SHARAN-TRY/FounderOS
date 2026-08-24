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
  AlertCircle,
  CheckCircle2,
  Moon,
  Sun,
  Hexagon,
  LogOut,
  Send,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeProvider';

export function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState('Founder');
  const [userPicture, setUserPicture] = useState<string | null>(null);

  // Goals tab states
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalRisk, setNewGoalRisk] = useState('Low');
  const [newGoalDate, setNewGoalDate] = useState('');

  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Launch my startup in 30 days",
      risk: "Medium",
      progress: 64,
      completedTasks: 18,
      totalTasks: 32,
      targetDate: "Sept 24, 2026",
      agents: ["CEO", "Marketing", "Finance", "Legal"],
      tasks: [
        { id: 1, name: "Draft legal incorporation papers", status: "completed", agent: "Legal" },
        { id: 2, name: "Establish Q3 marketing outline & budget", status: "completed", agent: "Finance" },
        { id: 3, name: "A/B test landing page headline variants", status: "running", agent: "Marketing" },
        { id: 4, name: "Schedule public launch press release", status: "pending", agent: "CEO" }
      ]
    },
    {
      id: 2,
      title: "Double ARR by Q3",
      risk: "Low",
      progress: 35,
      completedTasks: 7,
      totalTasks: 20,
      targetDate: "Oct 15, 2026",
      agents: ["CEO", "Sales", "Finance"],
      tasks: [
        { id: 1, name: "Map outbound sales workflow pipeline", status: "completed", agent: "CEO" },
        { id: 2, name: "Launch automated cold outreach campaigns", status: "running", agent: "Sales" },
        { id: 3, name: "Perform audit on customer acquisition costs", status: "pending", agent: "Finance" }
      ]
    },
    {
      id: 3,
      title: "Automate Customer Support",
      risk: "Low",
      progress: 90,
      completedTasks: 9,
      totalTasks: 10,
      targetDate: "Sept 10, 2026",
      agents: ["CEO", "Legal", "Compliance"],
      tasks: [
        { id: 1, name: "Integrate knowledge base into support agent", status: "completed", agent: "CEO" },
        { id: 2, name: "Establish fallback protocol to humans", status: "completed", agent: "Legal" },
        { id: 3, name: "Review privacy compliance logs", status: "running", agent: "Compliance" }
      ]
    },
    {
      id: 4,
      title: "Complete compliance audit",
      risk: "High",
      progress: 10,
      completedTasks: 1,
      totalTasks: 10,
      targetDate: "Sept 30, 2026",
      agents: ["Legal", "Compliance"],
      tasks: [
        { id: 1, name: "Collate compliance reports", status: "completed", agent: "Compliance" },
        { id: 2, name: "Draft certification papers", status: "running", agent: "Legal" }
      ]
    }
  ]);

  // Tasks tab states
  const [taskInput, setTaskInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [tasksList, setTasksList] = useState([
    {
      id: 1,
      title: "Hire a manager and launch ad campaign",
      status: "completed",
      date: "Aug 24, 2026",
      delegations: [
        { agent: "CEO", task: "Analyze goals and structure milestones", status: "completed" },
        { agent: "Hiring", task: "Draft job listing for marketing manager", status: "completed" },
        { agent: "Marketing", task: "Initialize Facebook & Google ad campaigns", status: "completed" }
      ]
    }
  ]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalDate) return;

    const newGoal = {
      id: Date.now(),
      title: newGoalTitle,
      risk: newGoalRisk,
      progress: 0,
      completedTasks: 0,
      totalTasks: 5,
      targetDate: newGoalDate,
      agents: ["CEO"],
      tasks: [
        { id: 1, name: "Initialize workspace core structures", status: "running", agent: "CEO" }
      ]
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalRisk('Low');
    setNewGoalDate('');
    setShowNewGoalModal(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisLogs([]);
    setSelectedTaskId(null);

    // Simulate logs with timeouts
    const logs = [
      "[CEO Agent] Parsing business objective...",
      "[CEO Agent] Identifying task dependencies...",
      "[CEO Agent] Mapping task to appropriate departments...",
      "[CEO Agent] Formulating agent delegation strategy...",
      "[CEO Agent] Tasks successfully delegated! Dispatching..."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setAnalysisLogs(prev => [...prev, log]);
        
        // Final step: Add task to list and reset state
        if (index === logs.length - 1) {
          setTimeout(() => {
            const inputLower = taskInput.toLowerCase();
            const delegations = [
              { agent: "CEO", task: "Evaluate and map sub-task directives", status: "completed" }
            ];

            if (inputLower.includes("hire") || inputLower.includes("recruiting") || inputLower.includes("talent") || inputLower.includes("hiring") || inputLower.includes("manager") || inputLower.includes("engineer")) {
              delegations.push({ agent: "Hiring", task: "Source applicants and draft role requirements", status: "running" });
            }
            if (inputLower.includes("money") || inputLower.includes("budget") || inputLower.includes("finance") || inputLower.includes("cost") || inputLower.includes("reconcile")) {
              delegations.push({ agent: "Finance", task: "Perform CA/LTV audits and allocate budget bounds", status: "running" });
            }
            if (inputLower.includes("marketing") || inputLower.includes("ads") || inputLower.includes("seo") || inputLower.includes("sales") || inputLower.includes("outreach") || inputLower.includes("product")) {
              delegations.push({ agent: "Marketing", task: "Deploy ad templates and schedule social media outreach", status: "running" });
            }
            if (inputLower.includes("legal") || inputLower.includes("contract") || inputLower.includes("terms") || inputLower.includes("agreements") || inputLower.includes("compliance")) {
              delegations.push({ agent: "Legal", task: "Review compliance papers and run standard contract risk check", status: "running" });
            }

            // Fallback delegation if no keywords match
            if (delegations.length === 1) {
              delegations.push({ agent: "Marketing", task: "Conduct initial market interest survey", status: "running" });
              delegations.push({ agent: "Finance", task: "Verify workspace cost structure constraints", status: "running" });
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const newTask = {
              id: Date.now(),
              title: taskInput,
              status: "running",
              date: dateStr,
              delegations
            };

            setTasksList(prev => [newTask, ...prev]);
            setTaskInput('');
            setIsAnalyzing(false);
            setAnalysisLogs([]);
            setSelectedTaskId(newTask.id); // auto-expand the new task
          }, 1000);
        }
      }, (index + 1) * 800);
    });
  };

  useEffect(() => {
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
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sidebarItems = [
    { name: 'Overview', icon: <LayoutDashboard size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Tasks', icon: <ClipboardList size={18} /> },
    { name: 'AI Team', icon: <Bot size={18} /> },
    { name: 'Workflow', icon: <GitBranch size={18} /> },
    { name: 'Memory', icon: <Cpu size={18} /> },
    { name: 'Approvals', icon: <CheckSquare size={18} /> },
    { name: 'Executions', icon: <Play size={18} /> },
    { name: 'Monitoring', icon: <Activity size={18} /> },
    { name: 'Audit Logs', icon: <FileText size={18} /> },
    { name: 'Integrations', icon: <LinkIcon size={18} /> },
  ];

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

  const liveActivity = [
    { agent: "CEO Agent", action: "Created execution plan.", time: "Just now", icon: <User size={14} className="text-[#8B5CF6]" />, bg: "bg-[#8B5CF6]/10" },
    { agent: "Finance Agent", action: "Flagged budget conflict.", time: "2 mins ago", icon: <AlertCircle size={14} className="text-amber-500" />, bg: "bg-amber-500/10" },
    { agent: "CEO Agent", action: "approved Task #402.", time: "15 mins ago", icon: <CheckCircle2 size={14} className="text-[#00DF89]" />, bg: "bg-[#00DF89]/10" }
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
                {item.icon}
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
          
          {/* Overview Panel */}
          {activeTab === 'Overview' && (
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
                      {liveActivity.map((activity, idx) => (
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
                          {goal.agents.map((agent, i) => (
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
                              {goal.tasks.map((task) => (
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
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{task.name}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded bg-founder-primary/10 text-founder-primary text-[9px] font-bold">
                                    {task.agent} Agent
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
              <div>
                <h2 className="text-2xl font-bold tracking-tight">AI Task Orchestrator</h2>
                <p className="text-sm text-gray-500 dark:text-founder-textMuted mt-1">delegate business tasks to the CEO Agent for dynamic resource analysis & department delegation.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left side: Task submission & Terminal Analysis */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold">Delegate Task</h3>
                    <form onSubmit={handleTaskSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="taskText" className="block text-xs font-semibold text-gray-400 dark:text-founder-textMuted uppercase tracking-wider">Describe task details</label>
                        <textarea 
                          id="taskText" 
                          rows={4}
                          value={taskInput}
                          onChange={(e) => setTaskInput(e.target.value)}
                          disabled={isAnalyzing}
                          className="w-full px-4 py-3 bg-gray-50/50 dark:bg-founder-dark/40 border border-gray-200 dark:border-founder-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-founder-primary focus:border-transparent outline-none transition-colors resize-none"
                          placeholder="e.g., We need to hire a frontend engineer, define compensation budget rules, and review legal SaaS contracts..."
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={isAnalyzing || !taskInput.trim()}
                        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-400 disabled:dark:bg-[#1C162E] disabled:text-gray-400 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#8B5CF6]/20"
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

                  {/* Terminal Simulation */}
                  <AnimatePresence>
                    {(isAnalyzing || analysisLogs.length > 0) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-[#090610] border border-[#231A36] rounded-2xl p-5 shadow-2xl h-[240px] flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between border-b border-[#231A36]/50 pb-2 mb-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            CEO TERMINAL LOGS
                          </span>
                          <span className="text-[9px] font-bold bg-[#00DF89]/10 text-[#00DF89] px-2 py-0.5 rounded">AUTO</span>
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-2 font-mono text-xs text-[#00DF89] pr-1 scrollbar-none">
                          {analysisLogs.map((log, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="leading-relaxed"
                            >
                              {log}
                            </motion.div>
                          ))}
                          {isAnalyzing && (
                            <span className="inline-block w-1.5 h-3.5 bg-[#00DF89] ml-1 animate-[ping_1s_infinite]" />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right side: Tasks list and Delegated details */}
                <div className="lg:col-span-3 space-y-4">
                  <h3 className="text-base font-bold">Delegated Tasks</h3>
                  <div className="space-y-4">
                    {tasksList.map((task) => {
                      const isSelected = selectedTaskId === task.id;
                      return (
                        <div 
                          key={task.id}
                          className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-5 hover:border-[#2D234A] transition-colors cursor-pointer"
                          onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                              <h4 className="font-bold text-gray-900 dark:text-white text-base">{task.title}</h4>
                              <p className="text-xs text-gray-400 dark:text-founder-textMuted">Created on: {task.date}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              task.status === 'completed'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                                : 'bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] animate-pulse'
                            }`}>
                              {task.status.toUpperCase()}
                            </span>
                          </div>

                          <AnimatePresence>
                            {isSelected && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-5 border-t border-gray-100 dark:border-[#251B38]/30 pt-4 space-y-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h5 className="text-xs font-bold text-gray-400 dark:text-founder-textMuted tracking-wider">CEO DELEGATION SCHEDULING</h5>
                                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:border-l before:border-dashed before:border-gray-300 dark:before:border-[#251B38]">
                                  {task.delegations.map((del, i) => (
                                    <div key={i} className="flex gap-4 relative z-10 bg-white dark:bg-[#120E1E]">
                                      <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                                        del.status === 'completed' 
                                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                                          : 'bg-founder-primary/20 border-founder-primary text-founder-primary animate-pulse'
                                      }`}>
                                        {del.agent.slice(0, 2).toUpperCase()}
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                          <span>{del.agent} Agent</span>
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            del.status === 'completed' ? 'bg-emerald-500' : 'bg-founder-primary animate-ping'
                                          }`} />
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-founder-textMuted">{del.task}</p>
                                      </div>
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
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other sections */}
          {activeTab !== 'Overview' && activeTab !== 'Goals' && activeTab !== 'Tasks' && (
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
