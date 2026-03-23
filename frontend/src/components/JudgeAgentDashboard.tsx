import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Activity, Clock, AlertTriangle, CheckCircle, TrendingUp, Zap, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';

interface JudgeLogEntry {
  id: string;
  queryId: string;
  caller: string;
  timestamp: bigint;
  hopDepth: number;
  timeoutResult: string;
  arbitrationOutcome: string;
  activeQueries: number;
  performanceMetric: number;
  governanceDecision: string;
  status: string;
}

interface JudgeMetrics {
  totalEntries: number;
  averageHopDepth: number;
  timeoutRatio: number;
  activeQueries: number;
  performanceScore: number;
}

interface HopCounterEntry {
  queryId: string;
  currentHopDepth: number;
  maxDepth: number;
  circular: boolean;
  incrementCount: number;
  protectionStatus: string;
}

interface ConditionalHeartbeat {
  isActive: boolean;
  activeQueries: number;
  enabledTimestamp: bigint | null;
  cyclesSaved: number;
  performanceMetric: number;
}

const JudgeAgentDashboard: React.FC = () => {
  const { actor } = useActor();

  const { data: metrics } = useQuery<JudgeMetrics>({
    queryKey: ['judgeMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await (actor as any).getJudgeMetrics();
      } catch (error) {
        console.error('Failed to fetch judge metrics:', error);
        return {
          totalEntries: 0,
          averageHopDepth: 0,
          timeoutRatio: 0,
          activeQueries: 0,
          performanceScore: 100
        };
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  const { data: logs = [] } = useQuery<JudgeLogEntry[]>({
    queryKey: ['judgeLogs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getJudgeLogEntries();
      } catch (error) {
        console.error('Failed to fetch judge logs:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  const { data: hopCounters = [] } = useQuery<HopCounterEntry[]>({
    queryKey: ['hopCounters'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getHopCounters();
      } catch (error) {
        console.error('Failed to fetch hop counters:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  const { data: heartbeat } = useQuery<ConditionalHeartbeat>({
    queryKey: ['conditionalHeartbeat'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await (actor as any).getConditionalHeartbeatStatus();
      } catch (error) {
        console.error('Failed to fetch heartbeat status:', error);
        return {
          isActive: false,
          activeQueries: 0,
          enabledTimestamp: null,
          cyclesSaved: 0,
          performanceMetric: 0
        };
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'active': return 'text-blue-600';
      case 'timeout': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProtectionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'limit_reached': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Total Arbitrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalEntries || 0}</div>
            <p className="text-xs text-muted-foreground">Cross-domain queries</p>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Avg Hop Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageHopDepth.toFixed(1) || '0.0'}</div>
            <Progress value={(metrics?.averageHopDepth || 0) / 15 * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeout Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((metrics?.timeoutRatio || 0) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">5s max per task</p>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.performanceScore || 100}</div>
            <p className="text-xs text-muted-foreground">Governance efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Heartbeat Status */}
      <Card className="modern-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Conditional ICP Heartbeat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={heartbeat?.isActive ? 'default' : 'secondary'}>
                  {heartbeat?.isActive ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {heartbeat?.isActive ? 'Monitoring active queries' : 'Conserving cycles'}
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Queries</span>
                <span className="text-lg font-bold">{heartbeat?.activeQueries || 0}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                User-initiated cross-domain
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cycles Saved</span>
                <span className="text-lg font-bold text-green-600">{heartbeat?.cyclesSaved || 0}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Through conditional activation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hop Counter Protection */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Hop Counter Protection (Max 15 Hops)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hopCounters.length > 0 ? (
            <div className="space-y-3">
              {hopCounters.slice(0, 5).map((counter) => (
                <div key={counter.queryId} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{counter.queryId.substring(0, 16)}...</span>
                    </div>
                    <Badge className={getProtectionStatusColor(counter.protectionStatus)}>
                      {counter.protectionStatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Current Depth</div>
                      <div className="font-semibold">{counter.currentHopDepth} / {counter.maxDepth}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Increments</div>
                      <div className="font-semibold">{counter.incrementCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Circular Detected</div>
                      <div className="font-semibold">
                        {counter.circular ? (
                          <span className="text-red-600">Yes</span>
                        ) : (
                          <span className="text-green-600">No</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(counter.currentHopDepth / counter.maxDepth) * 100} 
                    className="mt-3"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No active hop counters. Judge Agent is in passive mode.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Arbitration Logs */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Recent Arbitration Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : log.timeoutResult === 'timeout' ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span>Query {log.queryId.substring(0, 8)}...</span>
                        <Badge variant="outline" className="text-xs">
                          Hop {log.hopDepth}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.governanceDecision} • {log.timeoutResult}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {new Date(Number(log.timestamp) / 1000000).toLocaleString()}
                    </div>
                    <div className="text-xs">
                      <span className={getStatusColor(log.status)}>{log.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No arbitration logs yet. Judge Agent activates on user-initiated cross-domain queries.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graceful Failure Handling */}
      <Card className="modern-card border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Graceful Failure Handling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Non-Blocking Operations</div>
                <div className="text-xs text-muted-foreground">
                  All failures return safe "no-op" or "deferred" status - never Debug.trap
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Access Control Integration</div>
                <div className="text-xs text-muted-foreground">
                  Fallback defaults ensure continuous operation without startup traps
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Performance Metrics Exposure</div>
                <div className="text-xs text-muted-foreground">
                  Real-time metrics for Transparency Dashboard and admin monitoring
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JudgeAgentDashboard;
