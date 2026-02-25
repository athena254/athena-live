import { useEffect, useState } from 'react';
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
  status: string;
  requests: number;
  latency?: string;
}

interface Skill {
  name: string;
  status: string;
  tasks: number;
  category?: string;
}

interface Activity {
  time: string;
  event: string;
  agent: string;
  status: string;
}

export default function AthenaMissionControl() {
  const [data, setData] = useState<AthenaData | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [models, setModels] = useState<ModelAssignment[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [silentMode, setSilentMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");

  const fetchAllData = async () => {
    try {
      const [dataRes, agentsRes, modelsRes, protocolsRes, skillsRes, activityRes] = await Promise.all([
        fetch('api/data.json'),
        fetch('api/agents.json'),
        fetch('api/models.json'),
        fetch('api/protocols.json'),
        fetch('api/skills.json'),
        fetch('api/activity.json')
      ]);

      const dataJson = await dataRes.json();
      const agentsJson = await agentsRes.json();
      const modelsJson = await modelsRes.json();
      const protocolsJson = await protocolsRes.json();
      const skillsJson = await skillsRes.json();
      const activityJson = await activityRes.json();

      setData(dataJson);
      setAgents(agentsJson.agents);
      setModels(modelsJson.models);
      setProtocols(protocolsJson.protocols);
      setSkills(skillsJson.skills);
      setActivity(activityJson.activity);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    if (autoRefresh) {
      const interval = setInterval(fetchAllData, parseInt(refreshInterval) * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

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
        <div className="text-[#00ff88] text-xl animate-pulse">🦉 Loading Mission Control...</div>
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
            <Button variant="outline" size="sm" className="border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10" onClick={fetchAllData}>
              🔄 Refresh Now
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8a2be2] via-[#ff69b4] to-[#00ffff] bg-clip-text text-transparent">
            🦉 Athena Mission Control
          </h1>
          <p className="text-gray-400 text-lg">Lattice Multi-Agent System • Real-Time Data</p>
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
              <div className="text-2xl md:text-3xl font-bold text-[#00ffff]">{data?.skillsTracked || skills.length}</div>
              <p className="text-xs text-gray-400">Skills</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#ff69b4]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#ff69b4]">{data?.agents || agents.length}</div>
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
              <Card className="bg-black/40 border-[#ffd700]/30">
                <CardHeader>
                  <CardTitle className="text-[#ffd700] flex items-center gap-2">
                    ⚡ Active Protocols ({protocols.filter(p => p.active).length})
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

              <Card className="bg-black/40 border-[#00ffff]/30 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-[#00ffff]">📜 Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {activity.map((item, i) => (
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
                <CardDescription className="text-gray-400">{models.length} models in rotation pool</CardDescription>
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
                        {model.latency && <div className="text-xs text-[#00ffff]">{model.latency}</div>}
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
                        {skill.category && <span className="text-xs text-gray-500">[{skill.category}]</span>}
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
                  {activity.map((item, i) => (
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
          <p>🦉 Athena Mission Control v2.0 • Real-Time Data</p>
          <p className="mt-1">Auto-refresh: {autoRefresh ? `${refreshInterval}s` : 'Disabled'} | Data sources: 6 APIs</p>
        </div>
      </div>
    </div>
  );
}
