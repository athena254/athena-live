import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface BeelancerData {
  pendingBids: number;
  activeGigs: number;
  totalEarnings: number;
  winRate: number;
  lastUpdated: string;
}

interface Gig {
  id: string;
  title: string;
  value: number;
  status: string;
  deadline: string;
}

export default function BeelancerAnalytics() {
  const [data, setData] = useState<BeelancerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('api/data.json')
      .then(r => r.json())
      .then(d => {
        setData({
          pendingBids: d.pendingBids || 10,
          activeGigs: d.activeGigs || 0,
          totalEarnings: 0,
          winRate: 0,
          lastUpdated: d.lastUpdated
        });
        setLoading(false);
      });
  }, []);

  const mockGigs: Gig[] = [
    { id: "1", title: "React Dashboard Development", value: 1000, status: "pending", deadline: "2 days" },
    { id: "2", title: "API Integration", value: 750, status: "pending", deadline: "3 days" },
    { id: "3", title: "UI/UX Redesign", value: 500, status: "pending", deadline: "1 day" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a1a2a] flex items-center justify-center">
        <div className="text-[#00ff88] text-xl animate-pulse">Loading Beelancer Analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a1a2a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ffd700] to-[#ff8c00] bg-clip-text text-transparent">
            💰 Beelancer Analytics
          </h1>
          <p className="text-gray-400">Bidding Performance & Gig Tracking</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-black/40 border-yellow-500/30">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{data?.pendingBids || 0}</div>
              <p className="text-sm text-gray-400">Pending Bids</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#00ff88]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-[#00ff88]">{data?.activeGigs || 0}</div>
              <p className="text-sm text-gray-400">Active Gigs</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#00ffff]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-[#00ffff]">0</div>
              <p className="text-sm text-gray-400">Total Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-[#ff69b4]/30">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-[#ff69b4]">0%</div>
              <p className="text-sm text-gray-400">Win Rate</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-[#ffd700]/30">
          <CardHeader>
            <CardTitle className="text-[#ffd700]">📋 Active Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockGigs.map((gig) => (
                <div key={gig.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{gig.title}</div>
                    <div className="text-sm text-gray-400">{gig.deadline} • 🍯{gig.value}</div>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500">{gig.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button className="bg-[#ffd700]/20 border-[#ffd700] hover:bg-[#ffd700]/40">
            💰 Check New Gigs
          </Button>
        </div>

      </div>
    </div>
  );
}
