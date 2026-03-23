import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Database, TrendingUp, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceMetric {
  id: string;
  canister: string;
  metricType: string;
  value: bigint;
  timestamp: bigint;
}

const PerformanceMonitoring: React.FC = () => {
  const { actor } = useActor();

  const { data: metrics = [] } = useQuery<PerformanceMetric[]>({
    queryKey: ['performanceMetrics'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPerformanceMetrics();
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Mock data for demonstration
  const cycleUsageData = [
    { time: '00:00', cycles: 1200000 },
    { time: '04:00', cycles: 980000 },
    { time: '08:00', cycles: 1450000 },
    { time: '12:00', cycles: 1680000 },
    { time: '16:00', cycles: 1520000 },
    { time: '20:00', cycles: 1350000 },
  ];

  const canisterStats = [
    { name: 'Main Backend', cycles: 1520000, memory: 45, status: 'healthy' },
    { name: 'Proof of Life', cycles: 680000, memory: 28, status: 'healthy' },
    { name: 'LLM Integration', cycles: 2100000, memory: 62, status: 'warning' },
    { name: 'File Storage', cycles: 890000, memory: 38, status: 'healthy' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Total Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.19M</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43%</div>
            <Progress value={43} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124ms</div>
            <p className="text-xs text-muted-foreground">Query calls</p>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+32%</div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>
      </div>

      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Cycle Usage Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleUsageData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="cycles" 
                  stroke="oklch(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'oklch(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Canister Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {canisterStats.map((canister) => (
              <div key={canister.name} className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${canister.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                    <h4 className="font-semibold">{canister.name}</h4>
                  </div>
                  <Badge variant={canister.status === 'healthy' ? 'default' : 'secondary'}>
                    {canister.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Cycles Used</div>
                    <div className="font-medium">{(canister.cycles / 1000000).toFixed(2)}M</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Memory</div>
                    <div className="flex items-center gap-2">
                      <Progress value={canister.memory} className="flex-1" />
                      <span className="font-medium">{canister.memory}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="modern-card border-yellow-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="w-5 h-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span>LLM canister showing elevated cycle usage - consider implementing request batching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">•</span>
              <span>Proof of Life canister optimized successfully - 30% reduction in cycles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span>Consider implementing deferred async retry logic for HTTPS outcalls</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitoring;
