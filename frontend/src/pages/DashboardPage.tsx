import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
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
  Building2, 
  ChevronDown, 
  Search, 
  Bell, 
  Terminal, 
  AlertTriangle,
  Users,
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
  Scale,
  Sparkles,
  X,
  Copy,
  Check,
  CheckCheck,
  Lock,
  Sliders,
  ShieldCheck,
  Eye,
  RefreshCw,
  ArrowRight
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

  // Sidebar tab states
  const [isAgentsOpen, setIsAgentsOpen] = useState(true);

  // Tasks & CEO Orchestration states
  const [taskInput, setTaskInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Dedicated Agent Workspace Modal State
  const [activeWorkspaceDelegation, setActiveWorkspaceDelegation] = useState<any | null>(null);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('Rahul Sharma');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

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
        setTasksList(data.tasks);
        if (data.tasks.length > 0 && !selectedTaskId) {
          setSelectedTaskId(data.tasks[0].id);
        }
        setAuditLogs(data.audit_logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
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

  // 1. Task Creation & CEO Automatic Plan Generation
  const handleTaskSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSubmit = customPrompt || taskInput;
    if (!promptToSubmit.trim() || isAnalyzing) return;

    setActiveTab('CEO Agent');
    setIsAnalyzing(true);

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
          title: promptToSubmit,
          date: dateStr
        })
      });

      if (!taskRes.ok) throw new Error("Failed to create task");
      const createdTask = await taskRes.json();
      
      setTasksList(prev => [createdTask, ...prev.filter(t => t.id !== createdTask.id)]);
      setSelectedTaskId(createdTask.id);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setTaskInput('');
      setIsAnalyzing(false);
    }
  };

  // 2. Level A Approval: Approve CEO Plan
  const handleApprovePlan = async (taskId: number, decision: string = 'APPROVED', feedback?: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/plan/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision, feedback })
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasksList(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to approve plan:', err);
    }
  };

  // 3. Level A Rejection
  const handleRejectPlan = async (taskId: number) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/plan/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasksList(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to reject plan:', err);
    }
  };

  // 4. Start Agent Task Execution (START TASK Button)
  const handleStartAgentTask = async (delegationId: number) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    setIsRunningAgent(true);
    try {
      const res = await fetch(`${apiUrl}/api/agent-tasks/${delegationId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedDel = await res.json();
        setActiveWorkspaceDelegation(updatedDel);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to start agent task:', err);
    } finally {
      setIsRunningAgent(false);
    }
  };

  // 5. Level B Approval: Approve Agent Result
  const handleApproveAgentResult = async (delegationId: number, feedback?: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/agent-tasks/${delegationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback })
      });

      if (res.ok) {
        const updatedDel = await res.json();
        setActiveWorkspaceDelegation(updatedDel);
        setActionSuccessMessage(`✓ ${updatedDel.agent} Agent result approved! Downstream tasks unlocked.`);
        setTimeout(() => setActionSuccessMessage(null), 3500);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to approve result:', err);
    }
  };

  // 6. Level C Approval: Consequential Action Authorization
  const handleExecuteConsequentialAction = async (delegationId: number, actionId: string, actionName: string, payload: any = {}) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/agent-tasks/${delegationId}/consequential-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action_id: actionId,
          action_name: actionName,
          payload: { ...payload, candidate_name: selectedCandidate }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveWorkspaceDelegation(data.delegation);
        setActionSuccessMessage(`⚡ Consequential action '${actionName}' successfully authorized and dispatched!`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to execute consequential action:', err);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
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

  const currentSelectedTask = tasksList.find(t => t.id === selectedTaskId) || tasksList[0];

  const getAgentConfig = (agentName: string) => {
    if (agentName.includes('Hiring')) return { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-500', fill: '#10B981' };
    if (agentName.includes('Marketing')) return { icon: Megaphone, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30', badge: 'bg-[#8B5CF6]/20 text-[#8B5CF6]', fill: '#8B5CF6' };
    if (agentName.includes('Finance')) return { icon: DollarSign, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', badge: 'bg-[#3B82F6]/20 text-[#3B82F6]', fill: '#3B82F6' };
    if (agentName.includes('Legal')) return { icon: Scale, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-500', fill: '#F59E0B' };
    if (agentName.includes('Operations')) return { icon: Sliders, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20 text-cyan-500', fill: '#06B6D4' };
    return { icon: Bot, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30', badge: 'bg-gray-400/20 text-gray-400', fill: '#9CA3AF' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">READY TO EXECUTE</span>;
      case 'RUNNING':
        return <span className="bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> RUNNING</span>;
      case 'AWAITING_APPROVAL':
        return <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse">AWAITING APPROVAL</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><CheckCheck size={12} /> COMPLETED ✓</span>;
      case 'NEEDS_REVISION':
        return <span className="bg-red-500/15 text-red-500 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">NEEDS REVISION</span>;
      default:
        return <span className="bg-gray-100 dark:bg-[#1C162E] text-gray-400 border border-gray-200 dark:border-[#2D234A] px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Lock size={10} /> BLOCKED</span>;
    }
  };

  const metrics = [
    { title: "ACTIVE DIRECTIVES", value: tasksList.length.toString() },
    { title: "RUNNING AGENTS", value: tasksList.filter(t => t.status === 'APPROVED' || t.status === 'running').length.toString(), activeDot: true },
    { title: "AI WORKFORCE ACTIVE", value: "5" },
    { title: "AWAITING APPROVAL", value: tasksList.filter(t => t.status === 'AWAITING_PLAN_APPROVAL' || t.delegations?.some((d: any) => d.status === 'AWAITING_APPROVAL')).length.toString(), highlightClass: "border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.1)]" },
    { title: "COMPLETED DELIVERABLES", value: auditLogs.filter(a => a.action_type === 'APPROVAL').length.toString(), highlightClass: "border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.1)]" },
    { title: "SYSTEM HEALTH", value: "100%" }
  ];

  const teamProgress = [
    { name: "CEO Agent (Strategy)", progress: 95, color: "bg-[#8B5CF6]" },
    { name: "Finance Agent (Runway)", progress: 85, color: "bg-[#3B82F6]" },
    { name: "Marketing Agent (Outreach)", progress: 65, color: "bg-[#00DF89]" },
    { name: "Hiring Agent (Screening)", progress: 50, color: "bg-[#EC4899]" },
    { name: "Legal Agent (Compliance)", progress: 80, color: "bg-amber-500" }
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
        <main className="flex-grow overflow-y-auto p-8 space-y-8 bg-gray-50 dark:bg-[#0B0813] transition-colors duration-300 relative">
          {actionSuccessMessage && (
            <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-[#00DF89] text-gray-950 font-extrabold shadow-2xl flex items-center gap-3 animate-bounce">
              <CheckCheck size={20} />
              <span>{actionSuccessMessage}</span>
            </div>
          )}
          
          {/* Dashboard Panel */}
          {activeTab === 'Dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Welcome Dashboard Header */}
              {/* Welcome Dashboard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Founder Control Center</h2>
                  <p className="text-gray-500 dark:text-founder-textMuted text-sm font-medium mt-1">Autonomous executive team executing across your business.</p>
                </div>
              </div>

              {/* Section 17 & 1: Prominent Task Input Box */}
              <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-founder-primary/15 text-founder-primary flex items-center justify-center font-bold">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">What do you want to accomplish?</h3>
                      <p className="text-xs text-gray-500 dark:text-founder-textMuted">Type any founder objective. The CEO Agent will formulate the plan, assign agents, and wait for your approval.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => handleTaskSubmit(e)} className="flex items-center gap-3">
                  <input 
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    disabled={isAnalyzing}
                    placeholder="e.g., I want to hire a frontend developer."
                    className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#8B5CF6] transition-colors font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !taskInput.trim()}
                    className="px-7 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-300 disabled:dark:bg-[#1C162E] text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md shadow-[#8B5CF6]/20 shrink-0"
                  >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{isAnalyzing ? "Analyzing..." : "ENTER"}</span>
                  </button>
                </form>

                {/* Directive Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Try Sample Directives:</span>
                  <button
                    type="button"
                    onClick={() => handleTaskSubmit(undefined, "I want to hire a frontend intern with at most ₹10,000 per month stipend.")}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1C162E] hover:bg-gray-200 dark:hover:bg-[#251B38] text-gray-700 dark:text-gray-300 font-medium transition-colors border border-gray-200 dark:border-[#2D234A]"
                  >
                    💼 Hire Frontend Intern (≤ ₹10k/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTaskSubmit(undefined, "Analyze whether we can afford a new office with ₹15L annual rent.")}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1C162E] hover:bg-gray-200 dark:hover:bg-[#251B38] text-gray-700 dark:text-gray-300 font-medium transition-colors border border-gray-200 dark:border-[#2D234A]"
                  >
                    🏢 Afford New Office Lease (₹15L)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTaskSubmit(undefined, "Create a launch marketing strategy for our product.")}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1C162E] hover:bg-gray-200 dark:hover:bg-[#251B38] text-gray-700 dark:text-gray-300 font-medium transition-colors border border-gray-200 dark:border-[#2D234A]"
                  >
                    🚀 Product Marketing Launch
                  </button>
                </div>
              </div>

              {/* Metric Cards Grid */}
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

              {/* Active Tasks & Real-time Execution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Section 17: ACTIVE TASKS List with subtask statuses */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-founder-textMuted uppercase tracking-wider">EXECUTIVE WORKFLOW</span>
                        <h3 className="text-xl font-bold tracking-tight mt-0.5">Active Directives & Workflows</h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab('CEO Agent')}
                        className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1"
                      >
                        Open CEO Control Center <ArrowRight size={14} />
                      </button>
                    </div>

                    {tasksList.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-gray-200 dark:border-[#251B38] rounded-xl">
                        <Briefcase size={32} className="mx-auto text-gray-400 mb-2 opacity-50" />
                        <p className="text-sm font-semibold text-gray-500">No active directives yet. Enter an objective above.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {tasksList.slice(0, 3).map((task) => (
                          <div key={task.id} className="p-5 rounded-2xl bg-gray-50/70 dark:bg-[#1C162E]/60 border border-gray-200 dark:border-[#2D234A] space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">{task.title}</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Status: <span className="font-bold text-[#8B5CF6] uppercase">{task.status}</span> • Created {task.date}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-extrabold text-[#00DF89]">{task.progress || 0}%</span>
                                <button 
                                  onClick={() => { setSelectedTaskId(task.id); setActiveTab('CEO Agent'); }}
                                  className="px-3.5 py-1.5 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#8B5CF6] text-xs font-bold rounded-lg transition-colors"
                                >
                                  View Plan & Tasks
                                </button>
                              </div>
                            </div>

                            {/* Overall progress bar */}
                            <div className="w-full h-2 bg-gray-200 dark:bg-[#120E1E] rounded-full overflow-hidden">
                              <div className="h-full bg-[#00DF89] rounded-full transition-all duration-500" style={{ width: `${task.progress || 0}%` }}></div>
                            </div>

                            {/* Subtask statuses list */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200 dark:border-[#251B38]/60">
                              {(task.delegations && task.delegations.length > 0 ? task.delegations : [
                                { agent: 'Finance', status: 'READY' },
                                { agent: 'Marketing', status: 'BLOCKED' },
                                { agent: 'Hiring', status: 'BLOCKED' },
                                { agent: 'Legal', status: 'BLOCKED' }
                              ]).map((del: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] text-xs">
                                  <span className="font-bold text-gray-800 dark:text-gray-200">{del.agent}</span>
                                  {getStatusBadge(del.status)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: AI Team Progress & Live Activity */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Users size={18} className="text-gray-400" />
                      <h3 className="text-lg font-bold">Executive Capacity</h3>
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

                  <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">Live Audit Feed</h3>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DF89] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00DF89]"></span>
                      </span>
                    </div>

                    <div className="space-y-4 font-mono text-xs max-h-72 overflow-y-auto scrollbar-thin">
                      {auditLogs.length > 0 ? (
                        auditLogs.slice(0, 6).map((log, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#8B5CF6] text-[10px]">{log.agent_name}</span>
                              <span className="text-[9px] text-gray-400">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-[11px] text-gray-700 dark:text-gray-300 font-sans leading-tight">{log.summary}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">No audit events recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* CEO AGENT & TASK ORCHESTRATION TAB */}
          {(activeTab === 'CEO Agent' || activeTab === 'Tasks') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 pb-12"
            >
              {/* Directive Bar */}
              <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center font-bold">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">CEO Orchestrator Command</h3>
                      <p className="text-[11px] text-gray-500 dark:text-founder-textMuted">Submit any business directive. CEO Agent selects agents, sets dependencies, and awaits your approval.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => handleTaskSubmit(e)} className="flex items-center gap-3">
                  <input 
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    disabled={isAnalyzing}
                    placeholder="e.g., I want to hire a frontend developer."
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#8B5CF6] font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !taskInput.trim()}
                    className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-300 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md shadow-[#8B5CF6]/20 shrink-0"
                  >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{isAnalyzing ? "Analyzing..." : "Delegate to CEO"}</span>
                  </button>
                </form>

                {/* Suggestions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Try:</span>
                  <button
                    type="button"
                    onClick={() => handleTaskSubmit(undefined, "I want to hire a frontend intern with at most ₹10,000 per month stipend.")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#1C162E] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-[#251B38] border border-gray-200 dark:border-[#2D234A]"
                  >
                    💼 Hire Frontend Intern (≤ ₹10k/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTaskSubmit(undefined, "Analyze whether we can afford a new office with ₹15L annual rent.")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#1C162E] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-[#251B38] border border-gray-200 dark:border-[#2D234A]"
                  >
                    🏢 New Office Feasibility
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTaskSubmit(undefined, "Create a launch marketing strategy for our product.")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#1C162E] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-[#251B38] border border-gray-200 dark:border-[#2D234A]"
                  >
                    🚀 Marketing Launch Strategy
                  </button>
                </div>
              </div>

              {/* Task History Tabs */}
              {tasksList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Directives:</span>
                  {tasksList.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                        selectedTaskId === t.id
                          ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#8B5CF6]'
                          : 'bg-white dark:bg-[#120E1E] border-gray-200 dark:border-[#251B38] text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {t.title.length > 35 ? t.title.slice(0, 35) + '...' : t.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Section */}
              {!currentSelectedTask ? (
                <div className="p-16 text-center border border-dashed border-gray-200 dark:border-[#251B38] rounded-2xl">
                  <Briefcase size={36} className="mx-auto text-founder-primary/50 mb-3" />
                  <h3 className="text-lg font-bold">CEO Agent is on Standby</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Enter a task directive above to begin autonomous executive decomposition.</p>
                </div>
              ) : (
                (() => {
                  let planObj: any = null;
                  try {
                    planObj = currentSelectedTask.plan_data ? JSON.parse(currentSelectedTask.plan_data) : null;
                  } catch (e) {
                    console.error(e);
                  }

                  const isAwaitingPlanApproval = currentSelectedTask.status === 'AWAITING_PLAN_APPROVAL' || currentSelectedTask.status === 'CEO_ANALYZING';

                  // SECTION 4: CEO AGENT PLAN SCREEN
                  if (isAwaitingPlanApproval && planObj) {
                    return (
                      <div className="bg-white dark:bg-[#120E1E] border-2 border-[#8B5CF6]/40 rounded-3xl p-8 shadow-xl space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-[#251B38]">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#8B5CF6]/15 text-[#8B5CF6] px-2.5 py-0.5 rounded-md border border-[#8B5CF6]/30">
                                LEVEL A APPROVAL REQUIRED
                              </span>
                              <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                                PLAN READY FOR REVIEW
                              </span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">CEO AGENT PLAN</h2>
                            <p className="text-xs text-gray-500 dark:text-founder-textMuted mt-1">Review the proposed strategy, required departments, and task execution order before starting execution.</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRejectPlan(currentSelectedTask.id)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                            >
                              [ REJECT ]
                            </button>
                            <button
                              onClick={() => handleApprovePlan(currentSelectedTask.id)}
                              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-gray-950 bg-[#00DF89] hover:bg-[#00DF89]/90 shadow-md shadow-[#00DF89]/20 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={16} /> [ APPROVE PLAN ]
                            </button>
                          </div>
                        </div>

                        {/* Goal & CEO Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] space-y-3">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Goal Objective</p>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{planObj.goal || currentSelectedTask.title}</h3>
                            <div className="pt-2 border-t border-gray-200 dark:border-[#251B38] text-xs text-gray-500 space-y-1">
                              <p>Estimated Budget: <strong className="text-gray-900 dark:text-white">{planObj.budget_estimate || 'Standard'}</strong></p>
                              <p>Skipped Agents: <span className="text-gray-400">{(planObj.skipped_agents || []).join(', ') || 'None'}</span></p>
                            </div>
                          </div>

                          <div className="lg:col-span-2 p-5 rounded-2xl bg-gray-50 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] space-y-3">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Activity size={14} className="text-amber-500" /> CEO Analysis Breakdown
                            </p>
                            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                              {(planObj.analysis || []).map((item: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="font-medium leading-relaxed">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* EXECUTION PLAN: Numbered List */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <GitBranch size={16} className="text-[#8B5CF6]" /> Dynamic Execution Plan ({planObj.execution_steps?.length || 0} Steps)
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(planObj.execution_steps || []).map((step: any, idx: number) => {
                              const config = getAgentConfig(step.agent);
                              const Icon = config.icon;
                              return (
                                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] space-y-3 relative overflow-hidden shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${config.bg} ${config.color} border ${config.border}`}>
                                        <Icon size={16} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{step.order}. {step.agent} Agent</p>
                                        <p className="text-[10px] text-gray-400">
                                          {step.dependencies?.length > 0 ? `Requires ${step.dependencies.join(', ')} first` : 'Initial Autonomous Workstream'}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1C162E] text-gray-400">
                                      STEP {step.order}
                                    </span>
                                  </div>

                                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    {step.responsibility}
                                  </p>

                                  <div className="pt-3 border-t border-gray-100 dark:border-[#251B38]/50 text-[11px] text-gray-500 space-y-1">
                                    <p>Expected Output: <strong className="text-gray-800 dark:text-gray-200">{step.expected_output}</strong></p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Approval Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
                          <div className="flex items-center gap-3">
                            <ShieldCheck size={24} className="text-[#8B5CF6]" />
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Founder Authorization Gate</h4>
                              <p className="text-xs text-gray-500 dark:text-founder-textMuted">No agent tasks will execute until you approve the overall strategy.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRejectPlan(currentSelectedTask.id)}
                              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1C162E] transition-colors"
                            >
                              Reject Plan
                            </button>
                            <button
                              onClick={() => handleApprovePlan(currentSelectedTask.id)}
                              className="px-6 py-2.5 bg-[#00DF89] hover:bg-[#00DF89]/90 text-gray-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-[#00DF89]/20"
                            >
                              <CheckCircle2 size={16} /> Approve & Unlock Execution
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // SECTION 5 & 6: APPROVED TASK DETAIL & WORKFLOW GRAPH (CEO Control Center)
                  const delegations = currentSelectedTask.delegations || [];

                  return (
                    <div className="space-y-8">
                      <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ACTIVE DIRECTIVE WORKFLOW</span>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{currentSelectedTask.title}</h2>
                            <p className="text-xs text-gray-500 mt-1">Status: <strong className="text-emerald-500 uppercase">{currentSelectedTask.status}</strong> • Progress: <strong className="text-[#00DF89]">{currentSelectedTask.progress || 0}%</strong></p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => fetchDashboardData()}
                              className="p-2.5 rounded-xl border border-gray-200 dark:border-[#251B38] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                              title="Refresh State"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#00DF89]/15 text-[#00DF89] border border-[#00DF89]/30 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#00DF89] animate-pulse" />
                              ORCHESTRATION LIVE
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-gray-400">
                            <span>Overall Progress</span>
                            <span className="text-[#00DF89]">{currentSelectedTask.progress || 0}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-[#1C162E] rounded-full overflow-hidden border border-gray-200 dark:border-[#251B38]">
                            <div className="h-full bg-[#00DF89] rounded-full transition-all duration-500" style={{ width: `${currentSelectedTask.progress || 0}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* CEO Visual Dependency Graph */}
                      <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-6 shadow-sm overflow-x-auto">
                        <h3 className="text-sm font-bold text-center text-[#8B5CF6] uppercase tracking-wider mb-6">
                          CEO Agent Central Coordination Graph
                        </h3>

                        <div className="flex justify-center relative">
                          <div className="bg-white dark:bg-[#1C162E] border-2 border-founder-primary rounded-2xl p-4 flex items-center gap-3.5 w-64 z-10 shadow-lg shadow-founder-primary/10">
                            <div className="w-10 h-10 rounded-xl bg-founder-primary/20 text-founder-primary flex items-center justify-center font-bold">
                              <Briefcase size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white">CEO Agent</p>
                              <p className="text-[10px] text-emerald-500 font-semibold">Central Orchestrator</p>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-6 bg-founder-primary/50"></div>
                        </div>

                        <div className="relative mt-6 px-4 min-w-[700px]">
                          <div className="absolute top-0 left-[12.5%] right-[12.5%] h-[2px] bg-founder-primary/50"></div>
                          <div className="grid grid-cols-4 gap-4 pt-6">
                            {delegations.map((del: any, idx: number) => {
                              const config = getAgentConfig(del.agent);
                              const Icon = config.icon;
                              return (
                                <div key={idx} className="relative flex flex-col items-center">
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[2px] h-6" style={{ backgroundColor: config.fill + '80' }}></div>
                                  
                                  <div 
                                    onClick={() => setActiveWorkspaceDelegation(del)}
                                    className="w-full p-4 rounded-2xl bg-white dark:bg-[#120E1E] border hover:border-[#8B5CF6] cursor-pointer transition-all shadow-sm flex flex-col justify-between min-h-[140px]"
                                    style={{ borderColor: config.fill + '50' }}
                                  >
                                    <div className="flex items-center gap-2.5 mb-2">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.bg} ${config.color}`}>
                                        <Icon size={14} />
                                      </div>
                                      <span className="font-bold text-xs text-gray-900 dark:text-white">{del.agent} Agent</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">{del.task_description}</p>
                                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-[#251B38]/60 flex items-center justify-between">
                                      {getStatusBadge(del.status)}
                                      <span className="text-[10px] text-[#8B5CF6] font-bold hover:underline">Open &rarr;</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* SECTION 6: Agent Task Cards Grid */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">Departmental Workspaces ({delegations.length})</h3>
                          <span className="text-xs text-gray-400">Click Open Task to inspect details and execute</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {delegations.map((del: any, idx: number) => {
                            const config = getAgentConfig(del.agent);
                            const Icon = config.icon;
                            return (
                              <div 
                                key={idx} 
                                className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-[#8B5CF6] transition-colors"
                              >
                                <div>
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color} border ${config.border}`}>
                                        <Icon size={18} />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{del.agent} Agent</h4>
                                        <p className="text-[10px] text-gray-400">Order #{del.order_index || idx + 1}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2 mb-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Objective</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed line-clamp-3">
                                      {del.task_description}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#251B38]/60">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                                    {getStatusBadge(del.status)}
                                  </div>

                                  <button
                                    onClick={() => setActiveWorkspaceDelegation(del)}
                                    className="w-full py-2.5 px-4 bg-gray-100 dark:bg-[#1C162E] hover:bg-[#8B5CF6] hover:text-white text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                                  >
                                    <Eye size={14} /> OPEN TASK
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })()
              )}
            </motion.div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'Audit Logs' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Audit Trail</h2>
                <p className="text-xs text-gray-500 mt-1">Complete, immutable log of all CEO orchestrations, agent task executions, and founder approvals.</p>
              </div>

              <div className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-gray-50 dark:bg-[#1C162E] border-b border-gray-200 dark:border-[#251B38] text-[10px] uppercase font-bold text-gray-400">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Agent / Initiator</th>
                      <th className="p-4">Action Type</th>
                      <th className="p-4">Summary</th>
                      <th className="p-4">Security Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#251B38]/50">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1C162E]/50 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">{log.agent_name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            log.action_type === 'CONSEQUENTIAL_ACTION' ? 'bg-amber-500/15 text-amber-500' :
                            log.action_type === 'APPROVAL' ? 'bg-emerald-500/15 text-emerald-500' :
                            log.action_type === 'EXECUTION' ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' :
                            'bg-gray-100 dark:bg-[#1C162E] text-gray-400'
                          }`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{log.summary}</td>
                        <td className="p-4">
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <ShieldCheck size={14} /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <h2 className="text-2xl font-bold tracking-tight">{activeTab} Department</h2>
                  <p className="text-gray-500 dark:text-founder-textMuted text-sm font-medium mt-1">Autonomous worker connected to the CEO orchestration pipeline.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('CEO Agent')}
                  className="px-5 py-2.5 bg-[#8B5CF6] text-white font-bold rounded-xl text-xs hover:bg-[#7C3AED] transition-colors"
                >
                  View Active Directives in CEO Agent
                </button>
              </div>

              <div className="p-10 border border-dashed border-gray-200 dark:border-[#251B38] rounded-2xl text-center bg-white dark:bg-[#120E1E]">
                <Bot size={40} className="mx-auto text-[#8B5CF6] mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Department Connected to CEO Workflow</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
                  In FounderOS, all tasks for {activeTab} are orchestrated through the CEO Agent to maintain context and dependency order.
                </p>
                <button 
                  onClick={() => setActiveTab('CEO Agent')}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-[#1C162E] hover:bg-gray-200 dark:hover:bg-[#251B38] text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs"
                >
                  Open CEO Control Center
                </button>
              </div>
            </motion.div>
          )}

          {/* Fallback for other tabs */}
          {activeTab !== 'Dashboard' && activeTab !== 'Goals' && activeTab !== 'Tasks' && activeTab !== 'CEO Agent' && activeTab !== 'Audit Logs' && !['Hiring Agent', 'Marketing Agent', 'Finance Agent', 'Legal Agent'].includes(activeTab) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-2xl p-12 text-center shadow-sm"
            >
              <Bot className="mx-auto text-founder-primary/40 mb-4 animate-bounce" size={48} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{activeTab} Workspace</h3>
              <p className="text-gray-500 dark:text-founder-textMuted max-w-sm mx-auto">This section is synced with the CEO Agent orchestration core.</p>
            </motion.div>
          )}

        </main>
      </div>

      {/* SECTION 6, 7 & 8: DEDICATED AGENT TASK WORKSPACE MODAL */}
      <AnimatePresence>
        {activeWorkspaceDelegation && (
          (() => {
            const del = activeWorkspaceDelegation;
            const config = getAgentConfig(del.agent);
            const Icon = config.icon;
            let resultObj: any = {};
            try {
              resultObj = del.result_output ? JSON.parse(del.result_output) : {};
            } catch (e) {
              console.error(e);
            }

            let actionsAvail: any[] = [];
            try {
              actionsAvail = del.actions_available ? JSON.parse(del.actions_available) : [];
            } catch (e) {
              console.error(e);
            }

            let actionsTaken: any[] = [];
            try {
              actionsTaken = del.actions_taken ? JSON.parse(del.actions_taken) : [];
            } catch (e) {
              console.error(e);
            }

            const isBlocked = del.status === 'BLOCKED';
            const isReady = del.status === 'READY';
            const isRunning = del.status === 'RUNNING' || isRunningAgent;
            const isAwaitingApproval = del.status === 'AWAITING_APPROVAL';
            const isCompleted = del.status === 'COMPLETED';

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveWorkspaceDelegation(null)}
                  className="absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md"
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#120E1E] border border-gray-200 dark:border-[#251B38] rounded-3xl p-6 sm:p-8 z-10 shadow-2xl overflow-y-auto scrollbar-thin space-y-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-200 dark:border-[#251B38]">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${config.bg} ${config.color} border ${config.border}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${config.badge}`}>
                            {del.agent} Agent
                          </span>
                          {getStatusBadge(del.status)}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                          {del.agent} Task Workspace
                        </h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveWorkspaceDelegation(null)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C162E] transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* CEO Directive & Context */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] space-y-2">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Assigned Directive from CEO Agent</p>
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                      {del.task_description}
                    </p>
                  </div>

                  {/* Safety & Permissions Matrix */}
                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-[#130B24]/50 border border-gray-200 dark:border-[#251B38] flex flex-wrap items-center gap-4 text-[11px] text-gray-600 dark:text-gray-300">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Permissions:</span>
                    <span className="text-emerald-500 font-semibold">✓ Draft & Analyze</span>
                    <span className="text-emerald-500 font-semibold">✓ Score & Model</span>
                    <span className="text-red-400 font-semibold">✗ No Auto-Publish</span>
                    <span className="text-red-400 font-semibold">✗ No Auto-Spend</span>
                  </div>

                  {/* SECTION 7: PROMINENT START TASK BUTTON */}
                  {(isReady || isBlocked || isRunning) && !isAwaitingApproval && !isCompleted && (
                    <div className="p-6 rounded-2xl bg-[#8B5CF6]/10 border-2 border-dashed border-[#8B5CF6]/30 text-center space-y-3">
                      {isBlocked ? (
                        <>
                          <Lock size={28} className="mx-auto text-gray-400" />
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Task is Blocked by Upstream Dependencies</h4>
                          <p className="text-xs text-gray-400 max-w-sm mx-auto">
                            Waiting for upstream agent output to complete before this workspace unlocks.
                          </p>
                          <button
                            disabled
                            className="px-6 py-2.5 bg-gray-300 dark:bg-[#1C162E] text-gray-400 font-bold rounded-xl text-xs cursor-not-allowed"
                          >
                            START TASK (LOCKED)
                          </button>
                        </>
                      ) : (
                        <>
                          <Play size={28} className="mx-auto text-[#8B5CF6] animate-bounce" />
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Workspace Ready for Execution</h4>
                          <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            Click to trigger autonomous domain execution. Results will be presented for your review.
                          </p>
                          <button
                            onClick={() => handleStartAgentTask(del.id)}
                            disabled={isRunning}
                            className="px-8 py-3 bg-[#00DF89] hover:bg-[#00DF89]/90 text-gray-950 font-black rounded-xl text-sm shadow-lg shadow-[#00DF89]/20 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                          >
                            {isRunning ? <><Loader2 size={16} className="animate-spin" /> Executing {del.agent} Pipeline...</> : <><Play size={16} fill="currentColor" /> START TASK</>}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* SECTION 8 & 9: STRUCTURED RESULT & DECISION SUMMARY */}
                  {(isAwaitingApproval || isCompleted) && (
                    <div className="space-y-6 pt-2">
                      {/* Decision Summary */}
                      {del.decision_summary && (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                          <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Agent Decision Summary
                          </p>
                          <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                            {del.decision_summary}
                          </p>
                        </div>
                      )}

                      {/* Domain-specific Structured Results */}
                      {del.agent === 'Finance' && resultObj.salary_range && (
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#1C162E] border border-gray-200 dark:border-[#2D234A] space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Compensation & Runway Assessment</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="p-3 bg-white dark:bg-[#120E1E] rounded-xl border border-gray-200 dark:border-[#251B38]">
                              <p className="text-[10px] text-gray-400">Recommended Role</p>
                              <p className="text-xs font-bold text-gray-900 dark:text-white">{resultObj.recommended_role}</p>
                            </div>
                            <div className="p-3 bg-white dark:bg-[#120E1E] rounded-xl border border-gray-200 dark:border-[#251B38]">
                              <p className="text-[10px] text-gray-400">Recommended Salary Band</p>
                              <p className="text-xs font-bold text-emerald-500">{resultObj.salary_range}</p>
                            </div>
                            <div className="p-3 bg-white dark:bg-[#120E1E] rounded-xl border border-gray-200 dark:border-[#251B38]">
                              <p className="text-[10px] text-gray-400">Hiring Budget Ceiling</p>
                              <p className="text-xs font-bold text-[#3B82F6]">{resultObj.hiring_budget}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 pt-1">
                            <p>• <strong>Financial Assessment:</strong> <span className="text-emerald-500 font-bold">{resultObj.financial_assessment}</span></p>
                            <p>• <strong>Runway Impact:</strong> {resultObj.runway_impact}</p>
                            <p>• <strong>Rationale:</strong> {resultObj.reason}</p>
                          </div>
                        </div>
                      )}

                      {del.agent === 'Marketing' && resultObj.linkedin_post && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Generated Recruitment Campaign Copy</h4>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                              <span>LinkedIn Recruitment Post</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(resultObj.linkedin_post);
                                  setCopiedText(true);
                                  setTimeout(() => setCopiedText(false), 2000);
                                }}
                                className="text-[11px] text-[#8B5CF6] hover:underline flex items-center gap-1"
                              >
                                {copiedText ? <Check size={12} /> : <Copy size={12} />} Copy
                              </button>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-2xl text-xs font-sans whitespace-pre-wrap leading-relaxed border border-gray-800">
                              {resultObj.linkedin_post}
                            </pre>
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Telegram Channel Broadcast</span>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-2xl text-xs font-sans whitespace-pre-wrap leading-relaxed border border-gray-800">
                              {resultObj.telegram_post}
                            </pre>
                          </div>
                        </div>
                      )}

                      {del.agent === 'Hiring' && resultObj.candidates && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Screened & Ranked Candidate Leaderboard</h4>
                            <span className="text-xs font-bold text-emerald-500">{resultObj.candidates.length} Shortlisted Candidates</span>
                          </div>

                          <div className="space-y-3">
                            {resultObj.candidates.map((cand: any, i: number) => (
                              <div 
                                key={cand.id || i}
                                onClick={() => setSelectedCandidate(cand.name)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  selectedCandidate === cand.name 
                                    ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/10' 
                                    : 'bg-gray-50 dark:bg-[#1C162E] border-gray-200 dark:border-[#2D234A]'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    <h5 className="font-bold text-sm text-gray-900 dark:text-white">{cand.name}</h5>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                                      Match: {cand.match_score}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">{cand.experience} • {cand.current_company} • Expected: {cand.expected_salary}</p>
                                  <p className="text-[11px] text-gray-700 dark:text-gray-300 italic">{cand.interview_recommendation}</p>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${selectedCandidate === cand.name ? 'bg-[#8B5CF6] text-white' : 'bg-gray-200 dark:bg-[#120E1E] text-gray-600 dark:text-gray-400'}`}>
                                    {selectedCandidate === cand.name ? 'Selected for Offer' : 'Select'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {del.agent === 'Legal' && resultObj.offer_text && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-400 uppercase">Employment Offer Letter Ready</span>
                            <span className="text-emerald-500">Target Candidate: {resultObj.candidate_name}</span>
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-5 rounded-2xl text-xs font-sans whitespace-pre-wrap leading-relaxed border border-gray-800 max-h-60 overflow-y-auto">
                            {resultObj.offer_text}
                          </pre>
                        </div>
                      )}

                      {/* LEVEL B & LEVEL C APPROVAL ACTIONS BAR */}
                      <div className="pt-4 border-t border-gray-200 dark:border-[#251B38] space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <h5 className="text-xs font-extrabold text-gray-900 dark:text-white">Founder Action Approvals</h5>
                            <p className="text-[11px] text-gray-400">Authorize results or trigger consequential external dispatches.</p>
                          </div>

                          <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            {isAwaitingApproval && (
                              <button
                                onClick={() => handleApproveAgentResult(del.id)}
                                className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#00DF89] hover:bg-[#00DF89]/90 text-gray-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#00DF89]/20"
                              >
                                <CheckCircle2 size={16} /> [ APPROVE RESULT ]
                              </button>
                            )}

                            <button
                              onClick={() => setActiveWorkspaceDelegation(null)}
                              className="px-4 py-2.5 bg-gray-100 dark:bg-[#1C162E] hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs"
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        {/* Level C: Consequential Actions Buttons */}
                        {actionsAvail.length > 0 && (
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                            <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle size={14} /> Level C Consequential Actions (Requires Explicit Approval)
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                              {actionsAvail.map((act: any) => (
                                <button
                                  key={act.id}
                                  onClick={() => handleExecuteConsequentialAction(del.id, act.id, act.name, act)}
                                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <Zap size={14} /> {act.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions Taken Audit Record */}
                        {actionsTaken.length > 0 && (
                          <div className="p-3 bg-gray-50 dark:bg-[#1C162E] rounded-xl border border-gray-200 dark:border-[#2D234A] text-xs space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Completed Consequential Actions</p>
                            {actionsTaken.map((at: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-emerald-500 font-semibold text-[11px]">
                                <Check size={12} /> {at.action_name} at {at.timestamp}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </motion.div>
              </div>
            );
          })()
        )}
      </AnimatePresence>

      </div>
    );
  }
