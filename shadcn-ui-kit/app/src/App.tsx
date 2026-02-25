import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface AthenaData {
  lastUpdated: string;
  pendingBids: number;
  activeGigs: number;
  skillsTracked: number;
  agents: number;
  status: string;
}

interface Agent {
  name: string;
  role: string;
  emoji: string;
  status: string;
  model: string;
  fallback?: string;
  tasks?: number;
  uptime?: string;
}

interface Protocol {
  name: string;
  active: boolean;
  description: string;
}

interface ModelAssignment {
  name: string;
  key: string;
  status: "hot" | "warm" | "cold";
  requests: number;
}

const agents: Agent[] = [
  { name: "Athena", role: "Main Orchestrator", emoji: "🦉", status: "active", model: "GLM-5 Key #2", fallback: "qwen_nvidia", tasks: 47, uptime: "99.9%" },
  { name: "Sterling", role: "Finance / Bidding", emoji: "💰", status: "watching", model: "GLM-5 Key #1", fallback: "MiniMax-M2.5", tasks: 23, uptime: "100%" },
  { name: "Ishtar", role: "Oracle / PAI Research", emoji: "🌙", status: "ready", model: "OpenAI Codex", fallback: "GLM-5 Key #1", tasks: 15, uptime: "98.5%" },
  { name: "THEMIS", role: "Council Deliberation", emoji: "⚖️", status: "ready", model: "GLM-5 Key #1", fallback: "qwen coder", tasks: 12, uptime: "99.2%" },
  { name: "Felicity", role: "Code Artisan", emoji: "🎨", status: "ready", model: "qwen_nvidia", fallback: "MiniMax-M2.1", tasks: 34, uptime: "99.7%" },
  { name: "Prometheus", role: "Executor", emoji: "⚡", status: "ready", model: "GPT-4o", fallback: "grok-code-fast", tasks: 28, uptime: "98.9%" },
  { name: "Nexus", role: "Intelligence", emoji: "🧠", status: "ready", model: "qwen_nvidia", fallback: "GLM-5 Key #1", tasks: 19, uptime: "97.8%" },
  { name: "Cisco", role: "Security", emoji: "🔒", status: "ready", model: "GLM-5 Key #1", fallback: "gemini-3-pro", tasks: 8, uptime: "100%" },
  { name: "Delver", role: "Research", emoji: "🕵️", status: "ready", model: "llama", fallback: "qwen_nvidia", tasks: 11, uptime: "96.5%" },
  { name: "Squire", role: "Operations", emoji: "🤴", status: "ready", model: "GLM-5 Key #1", fallback: "qwen_nvidia", tasks: 22, uptime: "99.1%" },
];

const protocols: Protocol[] = [
  { name: "Always-On", active: true, description: "4 core agents never sleep" },
  { name: "Zero Downtime", active: true, description: "Instant failover on errors" },
  { name: "Zero Idle Resources", active: true, description: "38 models in rotation" },
  { name: "Silent Mode", active: true, description: "Beelancer alerts only on acceptance" },
  { name: "Model Rotation", active: true, description: "Auto-switch on rate limits" },
  { name: "Auto-Backup", active: true, description: "Daily GitHub sync" },
  { name: "Heartbeat Monitoring", active: true, description: "Periodic system checks" },
  { name: "Subagent Spawning", active: true, description: "Parallel task execution" },
];

const models: ModelAssignment[] = [
  { name: "GLM-5 Key #1", key: "custom-api-us-west-2-modal-direct", status: "hot", requests: 1247 },
  { name: "GLM-5 Key #2", key: "custom-api-us-west-2-modal-direct-2", status: "hot", requests: 982 },
  { name: "qwen_nvidia", key: "custom-integrate-api-nvidia-com", status: "hot", requests: 2156 },
  { name: "llama (Groq)", key: "custom-api-groq-com", status: "warm", requests: 456 },
  { name: "MiniMax-M2.1", key: "minimax-portal", status: "warm", requests: 234 },
  { name: "OpenAI Codex", key: "openai-codex", status: "hot", requests: 567 },
  { name: "OpenRouter Free", key: "openrouter/free", status: "cold", requests: 89 },
];

const skills = [
  { name: "agent-mention-router", status: "active", tasks: 234 },
  { name: "beelancer-bidder", status: "active", tasks: 156 },
  { name: "free-tts", status: "active", tasks: 89 },
  { name: "hot-swap-llm", status: "active", tasks: 67 },
  { name: "themis", status: "active", tasks: 45 },
  { name: "daily-backup", status: "active", tasks: 1 },
  { name: "automation-workflows", status: "ready", tasks: 0 },
];

const recentActivity = [
  { time: "23:52", event: "Data refresh completed", agent: "System", status: "success" },
  { time: "23:50", event: "GitHub sync completed", agent: "Athena", status: "success" },
  { time: "23:47", event: "React dashboard deployed", agent: "Felicity", status: "success" },
  { time: "23:45", event: "Beelancer poll - 10 pending", agent: "Sterling", status: "info" },
  { time: "23:42", event: "Data refresh completed", agent: "System", status: "success" },
  { time: "23:40", event: "Subagent spawned for research", agent: "Athena", status: "info" },
  { time: "23:38", event: "shadcn-ui kit installed", agent: "Felicity", status: "success" },
  { time: "23:35", event: "Security scan completed", agent: "Cisco", status: "success" },
];

export default function AthenaMissionControl() {
  const [data, setData] = useState<AthenaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [silentMode, setSilentMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, parseInt(refreshInterval) * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchData = async () => {
    try {
      const res = await fetch('api/data.json');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]';
      case 'watching': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
      case 'ready': return 'bg-[#00ffff]/20 text-[#00ffff] border-[#00ffff]';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'info': return 'bg-blue-500/20 text-blue-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'text-[#00ff88]';
      case 'warm': return 'text-yellow-400';
      case 'cold': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a1a2a] flex items-center justify-center">
        <div className="text-[#00ff88] text-xl animate-pulse">🦉 Loading Athena Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a1a2a] p-4 md:p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="absolute right-0 top-0 flex gap-2">
            <Button variant="outline" size="sm" className="border-[#8a2be2]/30 text-[#8a2be2] hover:bg-[#8a2be2]/10">
              ⚙️ Settings
            </Button>
            <Button variant="outline" size="sm" className="border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10">
              🔄 Refresh Now
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8a2be2] via-[#ff69b4] to-[#00ffff] bg-clip-text text-transparent">
            🦉 Athena Mission Control
          </h1>
          <p className="text-gray-400 text-lg">Lattice Multi-Agent System • Full Integration</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Badge variant="outline" className="border-[#00ff88]/50 text-[#00ff88]">
              🟢 Systems Online
            </Badge>
            <span className="text-gray-500 text-sm">
              Last sync: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card className="bg-black/40 border-yellow-500/30">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">{data?.pendingBids || 0}</div>
              <p className="text-xs text-gray-400">Pending Bids</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#00ff88]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#00ff88]">{data?.activeGigs || 0}</div>
              <p className="text-xs text-gray-400">Active Gigs</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#00ffff]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#00ffff]">{data?.skillsTracked || 0}</div>
              <p className="text-xs text-gray-400">Skills</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#ff69b4]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#ff69b4]">{data?.agents || 0}</div>
              <p className="text-xs text-gray-400">Agents</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#8a2be2]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#8a2be2]">{models.length}</div>
              <p className="text-xs text-gray-400">Models</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#ffd700]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#ffd700]">99.2%</div>
              <p className="text-xs text-gray-400">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-black/50 border border-[#8a2be2]/30 w-full justify-start overflow-x-auto">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#8a2be2]">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-[#8a2be2]">🦉 Agents</TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-[#8a2be2]">🔑 Models</TabsTrigger>
            <TabsTrigger value="protocols" className="data-[state=active]:bg-[#8a2be2]">⚡ Protocols</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-[#8a2be2]">🛠️ Skills</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#8a2be2]">📜 Activity</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#8a2be2]">⚙️ Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Protocols */}
              <Card className="bg-black/40 border-[#ffd700]/30">
                <CardHeader>
                  <CardTitle className="text-[#ffd700] flex items-center gap-2">
                    ⚡ Active Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {protocols.map((p) => (
                      <div key={p.name} className={`flex items-center gap-2 p-2 rounded-lg ${p.active ? 'bg-[#00ff88]/10' : 'bg-gray-800/50'}`}>
                        <div className={`w-2 h-2 rounded-full ${p.active ? 'bg-[#00ff88]' : 'bg-gray-500'}`} />
                        <span className="text-sm">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-black/40 border-[#8a2be2]/30">
                <CardHeader>
                  <CardTitle className="text-[#8a2be2]">🚀 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-[#8a2be2]/20 border-[#8a2be2] hover:bg-[#8a2be2]/40">
                      🕵️ Spawn Research
                    </Button>
                    <Button className="bg-[#ff69b4]/20 border-[#ff69b4] hover:bg-[#ff69b4]/40">
                      💰 Check Bids
                    </Button>
                    <Button className="bg-[#00ffff]/20 border-[#00ffff] hover:bg-[#00ffff]/40">
                      📊 Run Analytics
                    </Button>
                    <Button className="bg-[#00ff88]/20 border-[#00ff88] hover:bg-[#00ff88]/40">
                      🔒 Security Scan
                    </Button>
                    <Button className="bg-[#ffd700]/20 border-[#ffd700] hover:bg-[#ffd700]/40">
                      ⚖️ Council Meeting
                    </Button>
                    <Button className="bg-[#ff4500]/20 border-[#ff4500] hover:bg-[#ff4500]/40">
                      📦 Deploy Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-black/40 border-[#00ffff]/30 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-[#00ffff]">📜 Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                        <span className="text-gray-500 text-sm">{item.time}</span>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        <span className="flex-1 text-sm">{item.event}</span>
                        <span className="text-gray-500 text-sm">{item.agent}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.name} className="bg-black/40 border-[#8a2be2]/30 hover:border-[#8a2be2] transition-all">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#8a2be2]/30 text-2xl">{agent.emoji}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-bold text-white">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.role}</div>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>{agent.status}</Badge>
                    </div>
                    <Separator className="my-2 bg-gray-800" />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-[#00ffff]">{agent.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fallback:</span>
                        <span className="text-gray-300">{agent.fallback}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tasks:</span>
                        <span className="text-[#00ff88]">{agent.tasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uptime:</span>
                        <span className="text-[#ffd700]">{agent.uptime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models">
            <Card className="bg-black/40 border-[#00ffff]/30">
              <CardHeader>
                <CardTitle className="text-[#00ffff]">🔑 Model Status & Assignments</CardTitle>
                <CardDescription className="text-gray-400">38 models in rotation pool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {models.map((model) => (
                    <div key={model.name} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${model.status === 'hot' ? 'bg-[#00ff88]' : model.status === 'warm' ? 'bg-yellow-400' : 'bg-gray-500'}`} />
                        <div>
                          <div className="font-medium text-white">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.key}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getModelStatusColor(model.status)}>{model.status}</Badge>
                        <div className="text-xs text-gray-400 mt-1">{model.requests.toLocaleString()} requests</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Protocols Tab */}
          <TabsContent value="protocols">
            <div className="grid md:grid-cols-2 gap-4">
              {protocols.map((p) => (
                <Card key={p.name} className={`bg-black/40 border ${p.active ? 'border-[#00ff88]/30' : 'border-gray-700'}`}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${p.active ? 'bg-[#00ff88] animate-pulse' : 'bg-gray-500'}`} />
                        <span className="font-bold text-white">{p.name}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{p.description}</p>
                    </div>
                    <Switch checked={p.active} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <Card className="bg-black/40 border-[#ff69b4]/30">
              <CardHeader>
                <CardTitle className="text-[#ff69b4]">🛠️ Active Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-[#ff69b4]/50 text-[#ff69b4]">
                          {skill.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{skill.tasks} tasks</span>
                        <Badge className={getStatusColor(skill.status)}>{skill.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-black/40 border-[#00ffff]/30">
              <CardHeader>
                <CardTitle className="text-[#00ffff]">📜 Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-800 last:border-0">
                      <span className="text-gray-500 text-sm min-w-[50px]">{item.time}</span>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      <span className="flex-1 text-sm">{item.event}</span>
                      <span className="text-[#8a2be2] text-sm">{item.agent}</span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-[#8a2be2]/30">
                <CardHeader>
                  <CardTitle className="text-[#8a2be2]">⚙️ System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Silent Mode</Label>
                      <p className="text-xs text-gray-400">Only notify on bid acceptance</p>
                    </div>
                    <Switch checked={silentMode} onCheckedChange={setSilentMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Auto Refresh</Label>
                      <p className="text-xs text-gray-400">Automatically fetch live data</p>
                    </div>
                    <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                  </div>
                  <div>
                    <Label className="text-white">Refresh Interval</Label>
                    <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                      <SelectTrigger className="mt-1 bg-black/30 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-[#00ff88]/30">
                <CardHeader>
                  <CardTitle className="text-[#00ff88]">🔗 Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-[#00ff88]/10">
                    📊 Live Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-[#8a2be2]/10">
                    🔒 Security Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-[#00ffff]/10">
                    📈 Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-[#ffd700]/10">
                    ⚖️ Council Chamber
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pb-6">
          <p>🦉 Athena Mission Control v2.0 • Full Integration</p>
          <p className="mt-1">Auto-refresh: {autoRefresh ? `${refreshInterval}s` : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
}
