import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  AlertCircle,
  Zap,
  Database,
  Shield
} from 'lucide-react';

interface ArbitrationEvent {
  id: string;
  entryId: string;
  domain: string;
  priority: bigint;
  hopCount: number;
  latency: number;
  score: number;
  verdict: string;
  timestamp: bigint;
}

interface QAEvent {
  id: string;
  eventType: string;
  messageId: string;
  errorDetected: boolean;
  timestamp: bigint;
  cryptographicHash: string;
}

interface CascadePerformanceMetrics {
  totalEvents: bigint;
  averageLatency: number;
  throughputTPS: number;
  errorRate: number;
  cycleUsage: bigint;
  timestamp: bigint;
}

interface CascadeIntegrity {
  hasRequestLock: boolean;
  hasArbitration: boolean;
  hasValidation: boolean;
  hasWriteSuccess: boolean;
  timestampConsistency: boolean;
  hashChainValid: boolean;
}

export default function EnhancedTransparencyDashboard() {
  const { actor } = useActor();
  const [searchEntryId, setSearchEntryId] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const { data: arbitrationEvents = [], isLoading: loadingArbitration } = useQuery({
    queryKey: ['arbitrationEvents'],
    queryFn: async () => {
      if (!actor) return [];
      const transparencyActor = actor as any;
      return await transparencyActor.getArbitrationEvents() as ArbitrationEvent[];
    },
    enabled: !!actor,
  });

  const { data: qaEvents = [], isLoading: loadingQA } = useQuery({
    queryKey: ['qaEvents'],
    queryFn: async () => {
      if (!actor) return [];
      const transparencyActor = actor as any;
      return await transparencyActor.getQAEvents() as QAEvent[];
    },
    enabled: !!actor,
  });

  const { data: performanceMetrics, isLoading: loadingPerformance } = useQuery({
    queryKey: ['cascadePerformanceMetrics'],
    queryFn: async () => {
      if (!actor) return null;
      const transparencyActor = actor as any;
      return await transparencyActor.getCascadePerformanceMetrics() as CascadePerformanceMetrics;
    },
    enabled: !!actor,
    refetchInterval: 5000,
  });

  const { data: cascadeIntegrity, isLoading: loadingIntegrity } = useQuery({
    queryKey: ['cascadeIntegrity', selectedEntryId],
    queryFn: async () => {
      if (!actor || !selectedEntryId) return null;
      const transparencyActor = actor as any;
      return await transparencyActor.verifyCascadeIntegrity(selectedEntryId) as CascadeIntegrity;
    },
    enabled: !!actor && !!selectedEntryId,
  });

  const handleSearch = () => {
    if (searchEntryId.trim()) {
      setSelectedEntryId(searchEntryId.trim());
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'request_lock':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'arbitration_applied':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'write_success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'conflict_rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'validation_passed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'correction_issued':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rollback_executed':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const formatLatency = (latency: number) => {
    return `${latency.toFixed(2)}ms`;
  };

  if (loadingArbitration || loadingQA || loadingPerformance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading transparency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transparency Cascade</h2>
          <p className="text-muted-foreground">
            End-to-end verification and performance monitoring
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Shield className="w-4 h-4" />
          Nano Step 4 Complete
        </Badge>
      </div>

      {/* Performance Metrics Overview */}
      {performanceMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(performanceMetrics.totalEvents)}</div>
              <p className="text-xs text-muted-foreground">Cascade events logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatLatency(performanceMetrics.averageLatency)}</div>
              <p className="text-xs text-muted-foreground">Cross-canister latency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.throughputTPS.toFixed(2)} TPS</div>
              <p className="text-xs text-muted-foreground">Transactions per second</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.errorRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Failed operations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cycle Usage</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(performanceMetrics.cycleUsage).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total cycles consumed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cascade Integrity Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Cascade Integrity Verification</CardTitle>
          <CardDescription>
            Verify end-to-end cascade completeness for specific entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Entry ID to verify..."
              value={searchEntryId}
              onChange={(e) => setSearchEntryId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!searchEntryId.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Verify
            </Button>
          </div>

          {loadingIntegrity && (
            <div className="flex items-center justify-center py-8">
              <Activity className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {cascadeIntegrity && selectedEntryId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Entry ID: {selectedEntryId}</h4>
                {cascadeIntegrity.hasRequestLock && 
                 cascadeIntegrity.hasArbitration && 
                 cascadeIntegrity.hasValidation && 
                 cascadeIntegrity.hasWriteSuccess ? (
                  <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    <AlertCircle className="w-3 h-3" />
                    Incomplete
                  </Badge>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  {cascadeIntegrity.hasRequestLock ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Request Lock</span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  {cascadeIntegrity.hasArbitration ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Arbitration Applied</span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  {cascadeIntegrity.hasValidation ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">QA Validation</span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  {cascadeIntegrity.hasWriteSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Write Success</span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  {cascadeIntegrity.timestampConsistency ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Timestamp Consistency</span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  {cascadeIntegrity.hashChainValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Hash Chain Valid</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Logs */}
      <Tabs defaultValue="arbitration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="arbitration">Arbitration Events</TabsTrigger>
          <TabsTrigger value="qa">QA Validation Events</TabsTrigger>
        </TabsList>

        <TabsContent value="arbitration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arbitration Event Log</CardTitle>
              <CardDescription>
                Complete arbitration lifecycle with performance metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {arbitrationEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No arbitration events found
                    </div>
                  ) : (
                    arbitrationEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg border space-y-2 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getEventTypeColor(event.verdict)}>
                                {event.verdict.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <span className="text-sm font-mono text-muted-foreground">
                                {event.entryId}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Domain: {event.domain} | Priority: {Number(event.priority)}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Latency</p>
                            <p className="text-sm font-medium">{formatLatency(event.latency)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Hop Count</p>
                            <p className="text-sm font-medium">{event.hopCount.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="text-sm font-medium">{event.score.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QA Validation Event Log</CardTitle>
              <CardDescription>
                Semantic validation results with hash verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {qaEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No QA validation events found
                    </div>
                  ) : (
                    qaEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg border space-y-2 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getEventTypeColor(event.eventType)}>
                                {event.eventType.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {event.errorDetected ? (
                                <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-500 border-red-500/20">
                                  <AlertCircle className="w-3 h-3" />
                                  Error Detected
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Valid
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-mono text-muted-foreground">
                              Message ID: {event.messageId}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Cryptographic Hash</p>
                          <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                            {event.cryptographicHash}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
