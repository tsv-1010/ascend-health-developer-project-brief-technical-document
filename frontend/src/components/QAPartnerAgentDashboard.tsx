import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, Hash, Clock, Activity, TrendingUp, Eye, XCircle, RefreshCw, FileCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuditLogEntry {
  id: string;
  messageId: string;
  auditTimestamp: bigint;
  errorDetected: boolean;
  errorDescription: string | null;
  deterministicOutcomeVerified: boolean;
  discrepancyHash: string;
}

interface InterAgentMessage {
  messageId: string;
  sender: string;
  receiver: string;
  payload: string;
  timestamp: bigint;
  signature: string | null;
}

interface QAEvent {
  id: string;
  eventType: string;
  messageId: string;
  errorDetected: boolean;
  timestamp: bigint;
  cryptographicHash: string;
}

interface ValidationResult {
  score: number;
  verdict: 'pass' | 'correct' | 'rollback';
  explanation: string;
}

const QAPartnerAgentDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { actor } = useActor();

  // Fetch QA events from TransparencyDashboard
  const { data: qaEvents = [], isLoading: qaEventsLoading } = useQuery<QAEvent[]>({
    queryKey: ['qaEvents'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const events = await (actor as any).getQAEvents();
        return events || [];
      } catch (error) {
        console.error('Failed to fetch QA events:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Fetch validation results from QA Partner Agent
  const { data: validationResults = [], isLoading: validationLoading } = useQuery<Array<[string, ValidationResult]>>({
    queryKey: ['validationResults'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const results = await (actor as any).getValidationResults();
        return results || [];
      } catch (error) {
        console.error('Failed to fetch validation results:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Fetch rolled back entries
  const { data: rolledBackEntries = [], isLoading: rollbackLoading } = useQuery<string[]>({
    queryKey: ['rolledBackEntries'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const entries = await (actor as any).getRolledBackEntries();
        return entries || [];
      } catch (error) {
        console.error('Failed to fetch rolled back entries:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Calculate statistics
  const validationStats = {
    totalValidations: validationResults.length,
    passed: validationResults.filter(([_, result]) => result.verdict === 'pass').length,
    corrected: validationResults.filter(([_, result]) => result.verdict === 'correct').length,
    rolledBack: validationResults.filter(([_, result]) => result.verdict === 'rollback').length,
    averageScore: validationResults.length > 0 
      ? validationResults.reduce((sum, [_, result]) => sum + result.score, 0) / validationResults.length 
      : 0,
  };

  const qaEventStats = {
    totalEvents: qaEvents.length,
    validationPassed: qaEvents.filter(e => e.eventType === 'Validation_Passed').length,
    correctionIssued: qaEvents.filter(e => e.eventType === 'Correction_Issued').length,
    rollbackExecuted: qaEvents.filter(e => e.eventType === 'Rollback_Executed').length,
    errorsDetected: qaEvents.filter(e => e.errorDetected).length,
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === 'pass') return 'text-green-600';
    if (verdict === 'correct') return 'text-yellow-600';
    if (verdict === 'rollback') return 'text-red-600';
    return 'text-gray-600';
  };

  const getVerdictBadge = (verdict: string) => {
    if (verdict === 'pass') {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Passed</Badge>;
    }
    if (verdict === 'correct') {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Corrected</Badge>;
    }
    if (verdict === 'rollback') {
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Rolled Back</Badge>;
    }
    return <Badge variant="outline">{verdict}</Badge>;
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict === 'pass') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (verdict === 'correct') return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    if (verdict === 'rollback') return <XCircle className="w-4 h-4 text-red-600" />;
    return <FileCheck className="w-4 h-4" />;
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType === 'Validation_Passed') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (eventType === 'Correction_Issued') return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    if (eventType === 'Rollback_Executed') return <RefreshCw className="w-4 h-4 text-red-600" />;
    return <FileCheck className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="modern-card border-blue-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                QA Partner Agent Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Semantic validation, rollback integration, and comprehensive inter-agent message auditing
              </p>
            </div>
            <Badge variant="default" className="bg-blue-600">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Validation Statistics */}
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Validations</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{validationStats.totalValidations}</div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Passed</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{validationStats.passed}</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Corrected</span>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{validationStats.corrected}</div>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Rolled Back</span>
                <RefreshCw className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{validationStats.rolledBack}</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Avg Score</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{validationStats.averageScore.toFixed(1)}</div>
            </div>
          </div>

          <Separator className="my-6" />

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="validation">Validation Results</TabsTrigger>
              <TabsTrigger value="qa-events">QA Events</TabsTrigger>
              <TabsTrigger value="rollbacks">Rollbacks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">Semantic Validation & Rollback Integration</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  QA Partner Agent validates completed entries asynchronously, marks them as Validated, Corrected, or Rolled back, 
                  and automatically updates Blackboard state with TransparencyDashboard event recording.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold">Validation Capabilities</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Semantic Validation</div>
                      <div className="text-xs text-muted-foreground">
                        Validates entry content, domain, and insight quality with scoring (0-100)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Correction Issuance</div>
                      <div className="text-xs text-muted-foreground">
                        Issues corrections for entries with scores between 60-70
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Automatic Rollback</div>
                      <div className="text-xs text-muted-foreground">
                        Rolls back entries with scores ≤60 and updates Blackboard state
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Hash className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Hash-Verifiable Audit</div>
                      <div className="text-xs text-muted-foreground">
                        Generates cryptographic hashes for all validation events
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="text-sm font-semibold">Validation Performance</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pass Rate</span>
                    <span className="font-medium">
                      {validationStats.totalValidations > 0 
                        ? ((validationStats.passed / validationStats.totalValidations) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={validationStats.totalValidations > 0 
                      ? (validationStats.passed / validationStats.totalValidations) * 100 
                      : 0} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Correction Rate</span>
                    <span className="font-medium">
                      {validationStats.totalValidations > 0 
                        ? ((validationStats.corrected / validationStats.totalValidations) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={validationStats.totalValidations > 0 
                      ? (validationStats.corrected / validationStats.totalValidations) * 100 
                      : 0} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rollback Rate</span>
                    <span className="font-medium">
                      {validationStats.totalValidations > 0 
                        ? ((validationStats.rolledBack / validationStats.totalValidations) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={validationStats.totalValidations > 0 
                      ? (validationStats.rolledBack / validationStats.totalValidations) * 100 
                      : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4 mt-4">
              {validationLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading validation results...
                </div>
              ) : validationResults.length > 0 ? (
                <div className="space-y-3">
                  {validationResults.map(([entryId, result]) => (
                    <div key={entryId} className={`p-4 rounded-lg border ${
                      result.verdict === 'pass' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : result.verdict === 'correct'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getVerdictIcon(result.verdict)}
                          <span className="text-sm font-medium">Entry ID: {entryId.substring(0, 24)}...</span>
                        </div>
                        {getVerdictBadge(result.verdict)}
                      </div>
                      <div className="grid gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Validation Score:</span>
                          <span className={`font-semibold ${getVerdictColor(result.verdict)}`}>
                            {result.score.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 mt-2 p-2 bg-background/50 rounded">
                          <FileCheck className="w-3 h-3 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">{result.explanation}</span>
                        </div>
                        {result.verdict === 'rollback' && (
                          <Alert className="mt-2 border-red-500/30 bg-red-500/10">
                            <RefreshCw className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-xs text-red-600">
                              Entry rolled back - Blackboard state automatically updated
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">No validation results yet</p>
                  <p className="text-xs">
                    Validation results will appear here after entries are submitted for validation
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="qa-events" className="space-y-4 mt-4">
              {qaEventsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading QA events...
                </div>
              ) : qaEvents.length > 0 ? (
                <div className="space-y-3">
                  {qaEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.eventType)}
                          <span className="text-sm font-medium">{event.eventType.replace(/_/g, ' ')}</span>
                        </div>
                        <Badge variant={event.errorDetected ? 'destructive' : 'default'}>
                          {event.errorDetected ? 'Error' : 'Success'}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Message ID:</span>
                          <span className="font-mono">{event.messageId.substring(0, 24)}...</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Hash className="w-3 h-3 text-blue-600" />
                          <span className="font-mono text-blue-600 text-[10px]">
                            {event.cryptographicHash.substring(0, 32)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(Number(event.timestamp) / 1000000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">No QA events yet</p>
                  <p className="text-xs">
                    QA events will be logged here as validations are performed
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rollbacks" className="space-y-4 mt-4">
              {rollbackLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading rollback entries...
                </div>
              ) : rolledBackEntries.length > 0 ? (
                <div className="space-y-3">
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <RefreshCw className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-xs text-red-600">
                      {rolledBackEntries.length} entr{rolledBackEntries.length === 1 ? 'y' : 'ies'} rolled back due to validation failures
                    </AlertDescription>
                  </Alert>
                  {rolledBackEntries.map((entryId) => (
                    <div key={entryId} className="p-4 rounded-lg border bg-red-500/10 border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Rolled Back Entry</span>
                      </div>
                      <div className="grid gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Entry ID:</span>
                          <span className="font-mono">{entryId}</span>
                        </div>
                        <div className="mt-2 p-2 bg-red-500/20 rounded">
                          <span className="text-red-600">
                            Entry failed semantic validation and was automatically rolled back. Blackboard state has been updated.
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-600" />
                  <p className="font-medium mb-1">No rollbacks</p>
                  <p className="text-xs">
                    All validated entries have passed or been corrected - no rollbacks required
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Validation Scoring Criteria */}
      <Card className="modern-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <TrendingUp className="w-5 h-5" />
            Validation Scoring Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-green-600">Pass (Score &gt; 70)</div>
                <div className="text-xs text-muted-foreground">
                  Entry meets quality standards and is marked as Validated
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-600">Correct (Score 60-70)</div>
                <div className="text-xs text-muted-foreground">
                  Entry requires correction and is marked as Corrected
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <RefreshCw className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-600">Rollback (Score ≤ 60)</div>
                <div className="text-xs text-muted-foreground">
                  Entry fails validation and is automatically rolled back with Blackboard state update
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QAPartnerAgentDashboard;
