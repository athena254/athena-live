import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  LayoutDashboard, 
  Bot, 
  ListTodo, 
  BookOpen, 
  Key, 
  ScrollText, 
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  MoreVertical,
  Plus,
  Play,
  Edit2,
  FileText,
  Copy,
  RotateCcw,
  Trash2,
  Check,
  X,
  Clock,
  Activity,
  Zap,
  MessageSquare,
  XCircle,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

gsap.registerPlugin(ScrollTrigger);

// Mock Data
const tokenData = [
  { time: '00:00', tokens: 1200, cost: 0.12 },
  { time: '04:00', tokens: 800, cost: 0.08 },
  { time: '08:00', tokens: 2400, cost: 0.24 },
  { time: '12:00', tokens: 3600, cost: 0.36 },
  { time: '16:00', tokens: 2800, cost: 0.28 },
  { time: '20:00', tokens: 4200, cost: 0.42 },
  { time: '23:59', tokens: 1800, cost: 0.18 },
];

const agentData = [
  { id: 1, name: 'Athena Core', role: 'Main Orchestrator', status: 'active', tasks: 156, uptime: '99.9%', avatar: 'AC', level: 0, parentId: null },
  { id: 2, name: 'Code Weaver', role: 'Developer', status: 'active', tasks: 89, uptime: '98.5%', avatar: 'CW', level: 1, parentId: 1 },
  { id: 3, name: 'Data Scout', role: 'Researcher', status: 'idle', tasks: 45, uptime: '97.2%', avatar: 'DS', level: 1, parentId: 1 },
  { id: 4, name: 'Doc Sage', role: 'Documentation', status: 'active', tasks: 67, uptime: '99.1%', avatar: 'DG', level: 1, parentId: 1 },
  { id: 5, name: 'Test Hunter', role: 'QA Engineer', status: 'maintenance', tasks: 23, uptime: '95.8%', avatar: 'TH', level: 1, parentId: 1 },
  { id: 6, name: 'Deploy Bot', role: 'DevOps', status: 'active', tasks: 34, uptime: '98.9%', avatar: 'DB', level: 1, parentId: 1 },
];

const taskData = [
  { id: 'TSK-001', name: 'Generate API documentation', agent: 'Doc Sage', status: 'running', started: '2 min ago', eta: '3 min' },
  { id: 'TSK-002', name: 'Refactor auth module', agent: 'Code Weaver', status: 'completed', started: '15 min ago', eta: '-' },
  { id: 'TSK-003', name: 'Research competitor analysis', agent: 'Data Scout', status: 'queued', started: '-', eta: '10 min' },
  { id: 'TSK-004', name: 'Run integration tests', agent: 'Test Hunter', status: 'running', started: '5 min ago', eta: '8 min' },
  { id: 'TSK-005', name: 'Deploy to staging', agent: 'Deploy Bot', status: 'completed', started: '30 min ago', eta: '-' },
  { id: 'TSK-006', name: 'Optimize database queries', agent: 'Code Weaver', status: 'failed', started: '1 hour ago', eta: '-' },
];

const docFiles = [
  { id: 1, name: 'API Reference.md', type: 'markdown', size: '24 KB', updated: '2 hours ago', content: '# API Reference\n\n## Authentication\nAll API requests require a valid API key...' },
  { id: 2, name: 'Architecture.md', type: 'markdown', size: '18 KB', updated: '1 day ago', content: '# System Architecture\n\n## Overview\nThe system follows a microservices architecture...' },
  { id: 3, name: 'Deployment.md', type: 'markdown', size: '12 KB', updated: '3 days ago', content: '# Deployment Guide\n\n## Prerequisites\n- Docker 20.10+\n- Kubernetes 1.24+...' },
  { id: 4, name: 'Contributing.md', type: 'markdown', size: '8 KB', updated: '1 week ago', content: '# Contributing Guidelines\n\n## Code Style\nWe follow the Airbnb JavaScript style guide...' },
];

const apiKeys = [
  { id: 1, name: 'Production API Key', key: 'sk-athena-...7f3a', scopes: ['read', 'write', 'admin'], usage: 12500, status: 'active' },
  { id: 2, name: 'Staging API Key', key: 'sk-athena-...9b2c', scopes: ['read', 'write'], usage: 3400, status: 'active' },
  { id: 3, name: 'Development Key', key: 'sk-athena-...4d1e', scopes: ['read'], usage: 890, status: 'inactive' },
];

const logData = [
  { time: '14:32:15', level: 'info', service: 'Athena Core', message: 'Task TSK-001 started successfully' },
  { time: '14:31:42', level: 'success', service: 'Code Weaver', message: 'Code refactoring completed' },
  { time: '14:30:18', level: 'warning', service: 'Data Scout', message: 'Rate limit approaching for external API' },
  { time: '14:28:55', level: 'error', service: 'Test Hunter', message: 'Test suite failed: timeout exceeded' },
  { time: '14:25:33', level: 'info', service: 'Deploy Bot', message: 'Deployment to staging completed' },
  { time: '14:22:10', level: 'info', service: 'Athena Core', message: 'New agent registered: Doc Sage' },
];

// Types
interface Message {
  id: number;
  sender: 'athena' | 'user';
  text: string;
  time: string;
}

const chatMessages: Message[] = [
  { id: 1, sender: 'athena', text: 'Hello! I\'m Athena, your mission control assistant. How can I help you today?', time: '14:30' },
  { id: 2, sender: 'user', text: 'Show me the status of all active agents', time: '14:31' },
  { id: 3, sender: 'athena', text: 'Currently, 4 agents are active:\n\n• Athena Core (99.9% uptime)\n• Code Weaver (98.5% uptime)\n• Doc Sage (99.1% uptime)\n• Deploy Bot (98.9% uptime)\n\nAll systems operational.', time: '14:31' },
];

const subagentTasks = [
  { agent: 'Code Weaver', task: 'Refactoring auth module', progress: 75, subtasks: ['Analyze code', 'Extract functions', 'Write tests'] },
  { agent: 'Data Scout', task: 'Researching market trends', progress: 45, subtasks: ['Gather data', 'Analyze patterns', 'Generate report'] },
  { agent: 'Doc Sage', task: 'Generating API docs', progress: 90, subtasks: ['Parse endpoints', 'Write descriptions', 'Format output'] },
  { agent: 'Test Hunter', task: 'Running integration tests', progress: 30, subtasks: ['Setup environment', 'Execute tests', 'Collect results'] },
];

function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>(chatMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(docFiles[0]);
  const [docContent, setDocContent] = useState(docFiles[0].content);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'agents', icon: Bot, label: 'Agents' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'knowledge', icon: BookOpen, label: 'Knowledge' },
    { id: 'apikeys', icon: Key, label: 'API Keys' },
    { id: 'logs', icon: ScrollText, label: 'Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initial load animation
    const tl = gsap.timeline();
    tl.fromTo('.top-bar', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.left-rail', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.canvas-panel', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.4')
      .fromTo('.chat-panel', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6 }, '-=0.4');
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Simulate Athena response
    setTimeout(() => {
      const athenaResponse: Message = {
        id: messages.length + 2,
        sender: 'athena',
        text: 'I\'ve received your message. Processing your request...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, athenaResponse]);
    }, 1000);
  };

  const handleSaveDoc = () => {
    setIsEditing(false);
    // In a real app, this would save to backend
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
      case 'completed':
      case 'success':
        return 'text-success';
      case 'idle':
      case 'queued':
      case 'warning':
        return 'text-warning';
      case 'maintenance':
      case 'failed':
      case 'error':
      case 'inactive':
        return 'text-danger';
      default:
        return 'text-[#A7B0C8]';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-success/20 text-success';
      case 'idle':
      case 'queued':
        return 'bg-warning/20 text-warning';
      case 'maintenance':
      case 'failed':
        return 'bg-danger/20 text-danger';
      default:
        return 'bg-[#1A2236] text-[#A7B0C8]';
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-[#F4F7FF] font-sans">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Top Bar */}
      <header className="top-bar fixed top-0 left-0 right-0 h-14 bg-[#070A12]/90 backdrop-blur-md border-b border-[#1A2236] z-50 flex items-center px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-heading font-bold text-lg tracking-wider">ATHENA</span>
          </div>
          <Separator orientation="vertical" className="h-6 bg-[#1A2236]" />
          <span className="text-sm text-[#A7B0C8]">Dashboard / <span className="text-[#F4F7FF] capitalize">{activeSection}</span></span>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C8]" />
            <Input 
              placeholder="Search agents, tasks, docs..." 
              className="pl-10 bg-[#0E1322] border-[#1A2236] text-sm focus:border-cyan-500/50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-success/50 text-success bg-success/10">
            Production
          </Badge>
          <span className="text-sm text-[#A7B0C8] font-mono">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
            JD
          </div>
        </div>
      </header>

      {/* Left Rail */}
      <nav className={`left-rail fixed left-0 top-14 bottom-0 bg-[#0A0E1A] border-r border-[#1A2236] z-40 transition-all duration-300 ${sidebarExpanded ? 'w-56' : 'w-16'}`}>
        <div className="flex flex-col h-full py-4">
          <div className="flex-1 space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`nav-item w-full ${activeSection === item.id ? 'active' : ''}`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarExpanded && (
                    <span className="ml-3 text-sm">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="px-2 pt-4 border-t border-[#1A2236]">
            <button 
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="nav-item w-full"
            >
              {sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        ref={mainRef}
        className={`pt-14 transition-all duration-300 ${sidebarExpanded ? 'pl-56' : 'pl-16'} ${chatOpen ? 'pr-90' : 'pr-0'}`}
      >
        <div className="p-6 space-y-6">
          
          {/* Section 1: Overview */}
          <section id="overview" className="min-h-[calc(100vh-5rem)]">
            <div className="canvas-panel space-y-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-[#F4F7FF]">Overview</h1>
                <p className="text-[#A7B0C8] mt-1">Real-time system health and activity.</p>
              </div>

              {/* Primary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="metric-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#A7B0C8] text-sm">Active Agents</p>
                      <p className="text-4xl font-heading font-bold text-[#F4F7FF] mt-1">12</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-success" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="status-dot status-dot-active" />
                    <span className="text-xs text-success">4 online now</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#A7B0C8] text-sm">Tasks Today</p>
                      <p className="text-4xl font-heading font-bold text-[#F4F7FF] mt-1">847</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <ListTodo className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400">+12% from yesterday</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#A7B0C8] text-sm">API Calls (1h)</p>
                      <p className="text-4xl font-heading font-bold text-[#F4F7FF] mt-1">12.4k</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-warning" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-[#A7B0C8]">Avg latency: 45ms</span>
                  </div>
                </div>
              </div>

              {/* Token Usage & Events */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="metric-card lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold text-lg">Token Usage</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        <span className="text-[#A7B0C8]">Tokens</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span className="text-[#A7B0C8]">Cost ($)</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tokenData}>
                        <defs>
                          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00FFC2" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00FFC2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A2236" />
                        <XAxis dataKey="time" stroke="#A7B0C8" fontSize={12} />
                        <YAxis stroke="#A7B0C8" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0E1322', border: '1px solid #1A2236', borderRadius: '8px' }}
                          itemStyle={{ color: '#F4F7FF' }}
                        />
                        <Area type="monotone" dataKey="tokens" stroke="#00F0FF" fillOpacity={1} fill="url(#colorTokens)" />
                        <Area type="monotone" dataKey="cost" stroke="#00FFC2" fillOpacity={1} fill="url(#colorCost)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="metric-card">
                  <h3 className="font-heading font-semibold text-lg mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {[
                      { event: 'Agent Code Weaver completed task', time: '2 min ago', type: 'success' },
                      { event: 'New API key generated', time: '15 min ago', type: 'info' },
                      { event: 'High token usage warning', time: '1 hour ago', type: 'warning' },
                      { event: 'Deployment to production', time: '2 hours ago', type: 'success' },
                      { event: 'Agent Test Hunter failed', time: '3 hours ago', type: 'error' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#0B1020] transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          item.type === 'success' ? 'bg-success' : 
                          item.type === 'warning' ? 'bg-warning' : 
                          item.type === 'error' ? 'bg-danger' : 'bg-cyan-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#F4F7FF] truncate">{item.event}</p>
                          <p className="text-xs text-[#A7B0C8]">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subagent Monitor */}
              <div className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-lg">Subagent Monitor</h3>
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-2" />
                    Live
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subagentTasks.map((subagent, i) => (
                    <div key={i} className="p-4 rounded-lg bg-[#070A12] border border-[#1A2236]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium text-sm">{subagent.agent}</span>
                        </div>
                        <span className="text-xs text-[#A7B0C8]">{subagent.progress}%</span>
                      </div>
                      <p className="text-sm text-[#F4F7FF] mb-2">{subagent.task}</p>
                      <Progress value={subagent.progress} className="h-1.5 bg-[#1A2236]" />
                      <div className="mt-2 flex flex-wrap gap-1">
                        {subagent.subtasks.map((subtask, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2236] text-[#A7B0C8]">
                            {subtask}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
                <Button className="btn-secondary">
                  <Bot className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
                <Button className="btn-secondary" onClick={() => setChatOpen(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
              </div>
            </div>
          </section>

          {/* Section 2: Agents */}
          <section id="agents" className="min-h-[calc(100vh-5rem)] py-6">
            <div className="canvas-panel space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-[#F4F7FF]">Agents</h1>
                  <p className="text-[#A7B0C8] mt-1">Manage your AI workforce.</p>
                </div>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Active', 'Idle', 'Maintenance'].map((filter) => (
                  <button
                    key={filter}
                    className="px-4 py-1.5 rounded-full text-sm border border-[#1A2236] hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-[#A7B0C8] hover:text-[#F4F7FF]"
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Agent Hierarchy Tree */}
              <div className="relative">
                {/* Level 0: Athena Core (Main Orchestrator) */}
                <div className="flex justify-center mb-8">
                  {agentData.filter(a => a.level === 0).map((agent) => (
                    <div key={agent.id} className="metric-card group w-80 border-cyan-500/30 relative">
                      {/* Crown icon for leader */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500/20 border border-cyan-500/50 rounded-full">
                        <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Leader</span>
                      </div>
                      <div className="flex items-start justify-between pt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400/40 to-blue-600/40 flex items-center justify-center text-xl font-bold border border-cyan-500/30">
                            {agent.avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#F4F7FF] text-lg">{agent.name}</h3>
                            <p className="text-sm text-[#A7B0C8]">{agent.role}</p>
                          </div>
                        </div>
                        <div className={`status-dot ${
                          agent.status === 'active' ? 'status-dot-active' : 
                          agent.status === 'idle' ? 'status-dot-idle' : 'status-dot-offline'
                        }`} />
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#A7B0C8]">Tasks</p>
                          <p className="text-xl font-heading font-semibold">{agent.tasks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#A7B0C8]">Uptime</p>
                          <p className="text-xl font-heading font-semibold">{agent.uptime}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-1">
                          <Play className="w-3 h-3" /> Run
                        </button>
                        <button className="flex-1 py-1.5 rounded-lg bg-[#1A2236] text-[#A7B0C8] text-sm hover:bg-[#2A3246] transition-colors flex items-center justify-center gap-1">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button className="p-1.5 rounded-lg bg-[#1A2236] text-[#A7B0C8] hover:bg-[#2A3246] transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connection Lines - Vertical from Athena */}
                <div className="flex justify-center mb-2">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-500/50 to-cyan-500/20" />
                </div>

                {/* Horizontal connector line */}
                <div className="flex justify-center mb-2">
                  <div className="relative w-[90%] max-w-5xl">
                    <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                    {/* Vertical drops for each subagent */}
                    <div className="flex justify-between px-[10%]">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-cyan-500/30" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Level 1: Subordinate Agents */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {agentData.filter(a => a.level === 1).map((agent) => (
                    <div key={agent.id} className="metric-card group relative">
                      {/* Connection indicator */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-500/50" />
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-sm font-bold">
                            {agent.avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#F4F7FF] text-sm">{agent.name}</h3>
                            <p className="text-xs text-[#A7B0C8]">{agent.role}</p>
                          </div>
                        </div>
                        <div className={`status-dot ${
                          agent.status === 'active' ? 'status-dot-active' : 
                          agent.status === 'idle' ? 'status-dot-idle' : 'status-dot-offline'
                        }`} />
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-[#A7B0C8]">Tasks</p>
                          <p className="text-base font-heading font-semibold">{agent.tasks}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#A7B0C8]">Uptime</p>
                          <p className="text-base font-heading font-semibold">{agent.uptime}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-1">
                          <Play className="w-3 h-3" />
                        </button>
                        <button className="flex-1 py-1 rounded bg-[#1A2236] text-[#A7B0C8] text-xs hover:bg-[#2A3246] transition-colors flex items-center justify-center gap-1">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex justify-center gap-6 text-xs text-[#A7B0C8]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span>Idle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger" />
                    <span>Maintenance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-cyan-500/50" />
                    <span>Command Chain</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Tasks */}
          <section id="tasks" className="min-h-[calc(100vh-5rem)] py-6">
            <div className="canvas-panel space-y-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-[#F4F7FF]">Tasks</h1>
                <p className="text-[#A7B0C8] mt-1">Monitor execution and throughput.</p>
              </div>

              <Tabs defaultValue="running" className="w-full">
                <TabsList className="bg-[#0E1322] border border-[#1A2236]">
                  <TabsTrigger value="running" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                    Running
                  </TabsTrigger>
                  <TabsTrigger value="queue" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                    Queue
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="running" className="mt-4">
                  {/* Stats Bar */}
                  <div className="flex gap-4 mb-4">
                    <div className="px-4 py-2 rounded-lg bg-[#0E1322] border border-[#1A2236]">
                      <span className="text-xs text-[#A7B0C8]">Running </span>
                      <span className="text-lg font-heading font-semibold text-success">4</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[#0E1322] border border-[#1A2236]">
                      <span className="text-xs text-[#A7B0C8]">Queued </span>
                      <span className="text-lg font-heading font-semibold text-warning">12</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[#0E1322] border border-[#1A2236]">
                      <span className="text-xs text-[#A7B0C8]">Completed Today </span>
                      <span className="text-lg font-heading font-semibold text-cyan-400">312</span>
                    </div>
                  </div>

                  {/* Task Table */}
                  <div className="panel overflow-hidden">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Task</th>
                          <th>Agent</th>
                          <th>Status</th>
                          <th>Started</th>
                          <th>ETA</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskData.map((task) => (
                          <tr key={task.id}>
                            <td className="font-mono text-xs">{task.id}</td>
                            <td className="font-medium">{task.name}</td>
                            <td>{task.agent}</td>
                            <td>
                              <Badge className={getStatusBg(task.status)}>
                                {task.status}
                              </Badge>
                            </td>
                            <td className="text-[#A7B0C8]">{task.started}</td>
                            <td className="text-[#A7B0C8]">{task.eta}</td>
                            <td>
                              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="queue" className="mt-4">
                  <div className="panel p-8 text-center">
                    <Clock className="w-12 h-12 text-[#A7B0C8] mx-auto mb-4" />
                    <p className="text-[#A7B0C8]">12 tasks in queue</p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <div className="panel p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                    <p className="text-[#A7B0C8]">312 tasks completed today</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Section 4: Knowledge */}
          <section id="knowledge" className="min-h-[calc(100vh-5rem)] py-6">
            <div className="canvas-panel space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-[#F4F7FF]">Knowledge</h1>
                  <p className="text-[#A7B0C8] mt-1">Sources Athena can use.</p>
                </div>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* File List */}
                <div className="metric-card lg:col-span-1">
                  <h3 className="font-heading font-semibold mb-4">Files</h3>
                  <div className="space-y-2">
                    {docFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => {
                          setSelectedDoc(file);
                          setDocContent(file.content);
                          setIsEditing(false);
                        }}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedDoc.id === file.id 
                            ? 'bg-cyan-500/20 border border-cyan-500/50' 
                            : 'hover:bg-[#0B1020] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-cyan-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-[#A7B0C8]">{file.size} • {file.updated}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document Editor */}
                <div className="metric-card lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold">{selectedDoc.name}</h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                          <Button variant="ghost" size="sm" className="text-success" onClick={handleSaveDoc}>
                            <Check className="w-4 h-4 mr-1" /> Save
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      className="min-h-[400px] bg-[#070A12] border-[#1A2236] font-mono text-sm resize-none"
                    />
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="bg-[#070A12] p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                          {docContent}
                        </pre>
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: API Keys */}
          <section id="apikeys" className="min-h-[calc(100vh-5rem)] py-6">
            <div className="canvas-panel space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-[#F4F7FF]">API Keys</h1>
                  <p className="text-[#A7B0C8] mt-1">Manage credentials and access.</p>
                </div>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Key
                </Button>
              </div>

              <div className="panel overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key</th>
                      <th>Scopes</th>
                      <th>Usage (24h)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="font-medium">{key.name}</td>
                        <td className="font-mono text-xs">{key.key}</td>
                        <td>
                          <div className="flex gap-1">
                            {key.scopes.map((scope) => (
                              <span key={scope} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2236] text-[#A7B0C8] uppercase">
                                {scope}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{key.usage.toLocaleString()}</td>
                        <td>
                          <Badge className={getStatusBg(key.status)}>
                            {key.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Rotate</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-danger">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Revoke</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 6: Logs */}
          <section id="logs" className="min-h-[calc(100vh-5rem)] py-6">
            <div className="canvas-panel space-y-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-[#F4F7FF]">Logs</h1>
                <p className="text-[#A7B0C8] mt-1">System events and diagnostics.</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['All', 'Info', 'Warning', 'Error'].map((filter) => (
                    <button
                      key={filter}
                      className="px-4 py-1.5 rounded-full text-sm border border-[#1A2236] hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-[#A7B0C8] hover:text-[#F4F7FF]"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-success">Live</span>
                </div>
              </div>

              <div className="panel overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Level</th>
                      <th>Service</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.map((log, i) => (
                      <tr key={i}>
                        <td className="font-mono text-xs">{log.time}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {log.level === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
                            {log.level === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                            {log.level === 'warning' && <AlertCircle className="w-4 h-4 text-warning" />}
                            {log.level === 'error' && <XCircle className="w-4 h-4 text-danger" />}
                            <span className={getStatusColor(log.level)}>{log.level}</span>
                          </div>
                        </td>
                        <td>{log.service}</td>
                        <td className="max-w-md truncate">{log.message}</td>
                        <td>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 7: Settings */}
          <section id="settings" className="min-h-[calc(100vh-5rem)] py-6">
            <div className="canvas-panel space-y-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-[#F4F7FF]">Settings</h1>
                <p className="text-[#A7B0C8] mt-1">Preferences and system configuration.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Workspace */}
                <div className="metric-card space-y-4">
                  <h3 className="font-heading font-semibold text-lg">Workspace</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#A7B0C8]">Workspace Name</Label>
                      <Input defaultValue="Athena Production" className="mt-1 bg-[#070A12] border-[#1A2236]" />
                    </div>
                    <div>
                      <Label className="text-[#A7B0C8]">Timezone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger className="mt-1 bg-[#070A12] border-[#1A2236]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0E1322] border-[#1A2236]">
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#A7B0C8]">Default Model</Label>
                      <Select defaultValue="gpt4">
                        <SelectTrigger className="mt-1 bg-[#070A12] border-[#1A2236]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0E1322] border-[#1A2236]">
                          <SelectItem value="gpt4">GPT-4</SelectItem>
                          <SelectItem value="claude">Claude 3</SelectItem>
                          <SelectItem value="local">Local LLM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="metric-card space-y-4">
                  <h3 className="font-heading font-semibold text-lg">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#F4F7FF]">Email Notifications</Label>
                        <p className="text-xs text-[#A7B0C8]">Receive alerts via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#F4F7FF]">Webhook Alerts</Label>
                        <p className="text-xs text-[#A7B0C8]">Send alerts to external services</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#F4F7FF]">Quiet Hours</Label>
                        <p className="text-xs text-[#A7B0C8]">Suppress non-critical alerts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Integrations */}
                <div className="metric-card space-y-4">
                  <h3 className="font-heading font-semibold text-lg">Integrations</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Slack', connected: true },
                      { name: 'GitHub', connected: true },
                      { name: 'Linear', connected: false },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg bg-[#070A12]">
                        <span className="font-medium">{integration.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={integration.connected ? 'text-success' : 'text-[#A7B0C8]'}
                        >
                          {integration.connected ? 'Connected' : 'Connect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="metric-card border-danger/50">
                  <h3 className="font-heading font-semibold text-lg text-danger">Danger Zone</h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10">
                      <div>
                        <p className="font-medium text-danger">Reset System</p>
                        <p className="text-xs text-danger/70">Clear all data and restart</p>
                      </div>
                      <Button variant="outline" className="border-danger text-danger hover:bg-danger/20">
                        Reset
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10">
                      <div>
                        <p className="font-medium text-danger">Delete Workspace</p>
                        <p className="text-xs text-danger/70">Permanently delete everything</p>
                      </div>
                      <Button variant="outline" className="border-danger text-danger hover:bg-danger/20">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Bar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#1A2236]">
                <Button variant="ghost" className="text-[#A7B0C8]">Discard</Button>
                <Button className="btn-primary">Save Changes</Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Right Chat Panel */}
      <aside className={`chat-panel fixed right-0 top-14 bottom-0 bg-[#0A0E1A] border-l border-[#1A2236] z-40 transition-all duration-300 ${chatOpen ? 'w-90' : 'w-0 overflow-hidden'}`}>
        {chatOpen && (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1A2236]">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success" />
                </div>
                <span className="font-semibold">Athena</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setChatOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-cyan-500/20 border border-cyan-500/30' 
                        : 'bg-[#1A2236]'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-[10px] text-[#A7B0C8] mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-[#1A2236]">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Athena..."
                  className="flex-1 bg-[#070A12] border-[#1A2236]"
                />
                <Button className="btn-primary px-3" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Chat Toggle (when closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed right-4 bottom-4 w-12 h-12 rounded-full bg-cyan-500 text-[#070A12] flex items-center justify-center shadow-glow hover:shadow-glow-strong transition-all z-50"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default App;
