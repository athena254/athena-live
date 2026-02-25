import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface SecurityItem {
  name: string;
  status: "secure" | "warning" | "error";
  description: string;
}

export default function SecurityCenter() {
  const [items, setItems] = useState<SecurityItem[]>([]);

  useEffect(() => {
    setItems([
      { name: "Beelancer API Key", status: "secure", description: "Stored in credentials file (600)" },
      { name: "GitHub PAT", status: "secure", description: "Stored in config (600)" },
      { name: "OpenRouter Key", status: "secure", description: "Stored in credentials (600)" },
      { name: "Vercel Token", status: "secure", description: "Stored in config (600)" },
      { name: "Supermemory Key", status: "secure", description: "Stored in credentials (600)" },
      { name: "Git History", status: "warning", description: "Some old keys in history" },
      { name: "SSH Keys", status: "secure", description: "Properly configured (600)" },
      { name: "Skill Files", status: "secure", description: "No hardcoded keys found" },
    ]);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "secure": return <CheckCircle className="w-5 h-5 text-[#00ff88]" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "error": return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const secureCount = items.filter(i => i.status === "secure").length;
  const warningCount = items.filter(i => i.status === "warning").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a1a2a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff4444] to-[#ff8800] bg-clip-text text-transparent">
            🔒 Security Center
          </h1>
          <p className="text-gray-400">Credential Audit & Hardening Status</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-black/40 border-[#00ff88]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-4xl font-bold text-[#00ff88]">{secureCount}</div>
              <p className="text-sm text-gray-400">Secure</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-yellow-500/30">
            <CardContent className="pt-4 text-center">
              <div className="text-4xl font-bold text-yellow-400">{warningCount}</div>
              <p className="text-sm text-gray-400">Warnings</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#8a2be2]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-4xl font-bold text-[#8a2be2]">98%</div>
              <p className="text-sm text-gray-400">Security Score</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-[#ff4444]/30">
          <CardHeader>
            <CardTitle className="text-[#ff4444] flex items-center gap-2">
              <Shield className="w-5 h-5" /> Security Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-sm text-gray-400">{item.description}</div>
                    </div>
                  </div>
                  <Badge className={
                    item.status === "secure" ? "bg-[#00ff88]/20 text-[#00ff88]" :
                    item.status === "warning" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-500"
                  }>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-[#8a2be2]/30">
          <CardHeader>
            <CardTitle className="text-[#8a2be2]">🔐 Credential Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-black/30 rounded">
              <span className="text-gray-300">~/.config/beelancer/credentials.json</span>
              <Badge className="bg-[#00ff88]/20 text-[#00ff88]">600</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-black/30 rounded">
              <span className="text-gray-300">~/.config/openrouter/credentials.json</span>
              <Badge className="bg-[#00ff88]/20 text-[#00ff88]">600</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-black/30 rounded">
              <span className="text-gray-300">~/.config/gh/hosts.yml</span>
              <Badge className="bg-[#00ff88]/20 text-[#00ff88]">600</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button className="bg-[#ff4444]/20 border-[#ff4444] hover:bg-[#ff4444]/40">
            🔄 Run Security Scan
          </Button>
        </div>

      </div>
    </div>
  );
}
