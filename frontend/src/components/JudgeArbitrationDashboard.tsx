import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  TrendingUp,
  Search,
  AlertTriangle,
  Zap,
  GitBranch,
  Timer
} from 'lucide-react';

interface ArbitrationLogEntry {
  id: string;
  requestId: string;
  priority: bigint;
  hopCount: number;
  latency: number;
  score: number;
  verdict: { __kind__: 'approved' } | { __kind__: 'rejected' };
  timestamp: bigint;
  canonicalHash: string;
  requester: string;
}

export default function JudgeArbitrationDashboard() {
  const { actor } = useActor();
  const [searchRequestId, setSearchRequestId] = useState('');

  const { data: arbitrationLogs = [], isLoading } = useQuery({
    queryKey: ['judgeArbitrationLogs'],
    queryFn: async () => {
      if (!actor) return [];
      const judgeActor = actor as any;
      return await judgeActor.getArbitrationLogs() as ArbitrationLogEntry[];
    },
    enabled: !!actor,
    refetchInterval: 5000,
  });

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const formatLatency = (latency: number) => {
    return `${latency.toFixed(2)}ms`;
  };

  const getVerdictColor = (verdict: ArbitrationLogEntry['verdict']) => {
    return verdict.__kind__ === 'approved'
      ? 'bg-green-500/10 text-green-500 border-green-500/20'
      : 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  const getVerdictIcon = (verdict: ArbitrationLogEntry['verdict']) => {
    return verdict.__kind__ === 'approved' ? (
      <CheckCircle2 className="w-4 h-4" />
    ) : (
      <XCircle className="w-4 h-4" />
    );
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = arbitrationLogs.length;
    const approved = arbitrationLogs.filter(log => log.verdict.__kind__ === 'approved').length;
    const rejected = total - approved;
    const avgLatency = total > 0
      ? arbitrationLogs.reduce((sum, log) => sum + log.latency, 0) / total
      : 0;
    const avgHopCount = total > 0
      ? arbitrationLogs.reduce((sum, log) => sum + log.hopCount, 0) / total
      : 0;
    const avgScore = total > 0
      ? arbitrationLogs.reduce((sum, log) => sum + log.score, 0) / total
      : 0;

    return {
      total,
      approved,
      rejected,
      avgLatency,
      avgHopCount,
      avgScore,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
    };
  }, [arbitrationLogs]);

  const filteredLogs = searchRequestId.trim()
    ? arbitrationLogs.filter(log => 
        log.requestId.toLowerCase().includes(searchRequestId.toLowerCase()) ||
        log.id.toLowerCase().includes(searchRequestId.toLowerCase())
      )
    : arbitrationLogs;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading arbitration logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Judge Agent Arbitration</h2>
          <p className="text-muted-foreground">
            Complete lifecycle events with canonical timestamps and metadata
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Zap className="w-4 h-4" />
          Nano Step 4 Enhanced
        </Badge>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Arbitrations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved} approved, {stats.rejected} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLatency(stats.avgLatency)}</div>
            <p className="text-xs text-muted-foreground">Arbitration time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hop Count</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgHopCount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cross-domain hops</p>
          </CardContent>
        </Card>
      </div>

      {/* Deterministic Formula Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Deterministic Arbitration Formula</CardTitle>
          <CardDescription>
            Score calculation: Priority + (1 / HopCount) - Latency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono">
                score = priority + (1.0 / hopCount) - latency
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Verdict: <span className="font-semibold">approved</span> if score {'>'} 100.0, otherwise <span className="font-semibold">rejected</span>
              </p>
            </div>

            {stats.total > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Average Score</p>
                  <p className="text-2xl font-bold">{stats.avgScore.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Threshold</p>
                  <p className="text-2xl font-bold">100.0</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Above Threshold</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Arbitration Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Arbitration Event Log</CardTitle>
          <CardDescription>
            Complete lifecycle with canonical timestamps and hash signatures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by Request ID or Entry ID..."
              value={searchRequestId}
              onChange={(e) => setSearchRequestId(e.target.value)}
            />
            <Button variant="outline" onClick={() => setSearchRequestId('')}>
              Clear
            </Button>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchRequestId.trim() ? 'No matching arbitration logs found' : 'No arbitration logs available'}
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg border space-y-3 hover:bg-accent/50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getVerdictColor(log.verdict)}>
                            {getVerdictIcon(log.verdict)}
                            <span className="ml-1">{log.verdict.__kind__.toUpperCase()}</span>
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">
                            {log.requestId}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Arbitration ID: {log.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Timer className="w-3 h-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Priority</p>
                        <p className="text-sm font-medium">{Number(log.priority)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hop Count</p>
                        <p className="text-sm font-medium">{log.hopCount.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Latency</p>
                        <p className="text-sm font-medium">{formatLatency(log.latency)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-sm font-medium font-mono">{log.score.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Result</p>
                        <p className="text-sm font-medium">
                          {log.score > 100 ? (
                            <span className="text-green-500">Pass</span>
                          ) : (
                            <span className="text-red-500">Fail</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Hash Signature */}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Canonical Hash Signature</p>
                      <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                        {log.canonicalHash}
                      </p>
                    </div>

                    {/* Retry Logic Indicator */}
                    {log.latency > 1000 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-yellow-500">
                          High latency detected - retry logic may have been triggered
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
