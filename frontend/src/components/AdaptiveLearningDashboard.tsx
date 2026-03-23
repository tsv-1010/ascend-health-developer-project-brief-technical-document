import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, TrendingDown, Zap, Activity, Clock, Target, AlertTriangle, CheckCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface AdaptiveLearningMetric {
  id: string;
  metricType: 'adaptation_rate' | 'confidence_rate' | 'correction_trend' | 'feedback_latency';
  value: number;
  timestamp: bigint;
  context: string;
}

interface CorrectionTrend {
  timestamp: bigint;
  correctionType: 'semantic' | 'arbitration' | 'validation';
  beforeScore: number;
  afterScore: number;
  improvementRate: number;
}

interface FeedbackLoop {
  id: string;
  sourceType: 'sentinel' | 'qa' | 'judge';
  detectedAnomaly: string;
  adaptationApplied: string;
  latencyMs: number;
  successRate: number;
  timestamp: bigint;
}

const AdaptiveLearningDashboard: React.FC = () => {
  const { actor } = useActor();

  // Fetch adaptive learning metrics
  const { data: learningMetrics = [], isLoading: metricsLoading } = useQuery<AdaptiveLearningMetric[]>({
    queryKey: ['adaptiveLearningMetrics'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const metrics = await (actor as any).getAdaptiveLearningMetrics();
        return metrics || [];
      } catch (error) {
        console.error('Failed to fetch adaptive learning metrics:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  // Fetch correction trends
  const { data: correctionTrends = [], isLoading: trendsLoading } = useQuery<CorrectionTrend[]>({
    queryKey: ['correctionTrends'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const trends = await (actor as any).getCorrectionTrends();
        return trends || [];
      } catch (error) {
        console.error('Failed to fetch correction trends:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  // Fetch feedback loops
  const { data: feedbackLoops = [], isLoading: loopsLoading } = useQuery<FeedbackLoop[]>({
    queryKey: ['feedbackLoops'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const loops = await (actor as any).getFeedbackLoops();
        return loops || [];
      } catch (error) {
        console.error('Failed to fetch feedback loops:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  // Calculate statistics
  const adaptationRate = learningMetrics
    .filter(m => m.metricType === 'adaptation_rate')
    .reduce((sum, m) => sum + m.value, 0) / Math.max(learningMetrics.filter(m => m.metricType === 'adaptation_rate').length, 1);

  const confidenceRate = learningMetrics
    .filter(m => m.metricType === 'confidence_rate')
    .reduce((sum, m) => sum + m.value, 0) / Math.max(learningMetrics.filter(m => m.metricType === 'confidence_rate').length, 1);

  const avgFeedbackLatency = learningMetrics
    .filter(m => m.metricType === 'feedback_latency')
    .reduce((sum, m) => sum + m.value, 0) / Math.max(learningMetrics.filter(m => m.metricType === 'feedback_latency').length, 1);

  const avgImprovementRate = correctionTrends.length > 0
    ? correctionTrends.reduce((sum, t) => sum + t.improvementRate, 0) / correctionTrends.length
    : 0;

  const recurringAnomalies = feedbackLoops.filter(loop => {
    const similarAnomalies = feedbackLoops.filter(l => l.detectedAnomaly === loop.detectedAnomaly);
    return similarAnomalies.length > 1;
  }).length;

  const avgLoopSuccessRate = feedbackLoops.length > 0
    ? feedbackLoops.reduce((sum, loop) => sum + loop.successRate, 0) / feedbackLoops.length
    : 0;

  const avgLoopLatency = feedbackLoops.length > 0
    ? feedbackLoops.reduce((sum, loop) => sum + loop.latencyMs, 0) / feedbackLoops.length
    : 0;

  const getSourceIcon = (source: string) => {
    if (source === 'sentinel') return <Activity className="w-4 h-4 text-blue-600" />;
    if (source === 'qa') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (source === 'judge') return <Target className="w-4 h-4 text-purple-600" />;
    return <Brain className="w-4 h-4" />;
  };

  const getCorrectionTypeColor = (type: string) => {
    if (type === 'semantic') return 'bg-green-500/10 text-green-600 border-green-500/30';
    if (type === 'arbitration') return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
    if (type === 'validation') return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <Card className="modern-card border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                Adaptive Learning Feedback Loops
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Nano Step 6: Continuous adaptive intelligence across all agents via feedback loops
              </p>
            </div>
            <Badge variant="default" className="bg-purple-600">
              Self-Improving
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Adaptation Rate</span>
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{adaptationRate.toFixed(1)}%</div>
              <Progress value={adaptationRate} className="mt-2 h-1" />
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Confidence Rate</span>
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{confidenceRate.toFixed(1)}%</div>
              <Progress value={confidenceRate} className="mt-2 h-1" />
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Avg Feedback Latency</span>
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{avgFeedbackLatency.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground mt-1">
                Target: &lt;10s
              </div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Recurring Anomalies</span>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{recurringAnomalies}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Decreasing trend
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="modern-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Learning Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {avgImprovementRate > 0 ? avgImprovementRate.toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average improvement rate from corrections
            </p>
            <div className="mt-3 p-2 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Target: ≥95%</span>
                <span className={avgImprovementRate >= 95 ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                  {avgImprovementRate >= 95 ? '✓ Met' : 'In Progress'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              Feedback Loop Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {avgLoopSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful adaptive corrections applied
            </p>
            <div className="mt-3 p-2 bg-blue-500/10 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Loops:</span>
                <span className="font-semibold">{feedbackLoops.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Correction Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {avgLoopLatency.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average time from detection to adaptation
            </p>
            <div className="mt-3 p-2 bg-purple-500/10 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CAR Target:</span>
                <span className={avgLoopLatency < 10000 ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                  {avgLoopLatency < 10000 ? '✓ &lt;10s' : 'Optimizing'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="feedback-loops" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedback-loops">Feedback Loops</TabsTrigger>
          <TabsTrigger value="correction-trends">Correction Trends</TabsTrigger>
          <TabsTrigger value="metrics">Adaptive Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback-loops" className="space-y-4 mt-4">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Active Feedback Loops
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time adaptive corrections from Sentinel alerts, QA validations, and Judge arbitrations
              </p>
            </CardHeader>
            <CardContent>
              {loopsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading feedback loops...
                </div>
              ) : feedbackLoops.length > 0 ? (
                <div className="space-y-3">
                  {feedbackLoops.slice(0, 10).map((loop) => (
                    <div key={loop.id} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(loop.sourceType)}
                          <span className="text-sm font-medium capitalize">{loop.sourceType} Alert</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={loop.successRate >= 95 ? 'default' : 'secondary'}>
                            {loop.successRate.toFixed(0)}% Success
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {loop.latencyMs}ms
                          </Badge>
                        </div>
                      </div>
                      <div className="grid gap-2 text-xs">
                        <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded">
                          <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-red-600">Detected Anomaly:</span>
                            <p className="text-muted-foreground mt-1">{loop.detectedAnomaly}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-green-600">Adaptation Applied:</span>
                            <p className="text-muted-foreground mt-1">{loop.adaptationApplied}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(Number(loop.timestamp) / 1000000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">No feedback loops yet</p>
                  <p className="text-xs">
                    Adaptive learning will activate as agents detect and correct anomalies
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correction-trends" className="space-y-4 mt-4">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Correction Trends & Improvements
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track how corrections improve system accuracy over time
              </p>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading correction trends...
                </div>
              ) : correctionTrends.length > 0 ? (
                <div className="space-y-3">
                  {correctionTrends.slice(0, 10).map((trend, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getCorrectionTypeColor(trend.correctionType)}>
                          {trend.correctionType}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {trend.improvementRate > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-semibold ${trend.improvementRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.improvementRate > 0 ? '+' : ''}{trend.improvementRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Before Score:</span>
                          <div className="text-lg font-semibold mt-1">{trend.beforeScore.toFixed(1)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">After Score:</span>
                          <div className="text-lg font-semibold text-green-600 mt-1">{trend.afterScore.toFixed(1)}</div>
                        </div>
                      </div>
                      <Progress 
                        value={(trend.afterScore / 100) * 100} 
                        className="mt-3 h-2" 
                      />
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(Number(trend.timestamp) / 1000000).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-600" />
                  <p className="font-medium mb-1">No correction trends yet</p>
                  <p className="text-xs">
                    Trends will appear as the system learns from corrections
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4 mt-4">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Adaptive Learning Metrics
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed metrics tracking adaptation rate, confidence, and feedback latency
              </p>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading adaptive metrics...
                </div>
              ) : learningMetrics.length > 0 ? (
                <div className="space-y-4">
                  {['adaptation_rate', 'confidence_rate', 'feedback_latency'].map((type) => {
                    const typeMetrics = learningMetrics.filter(m => m.metricType === type);
                    const avgValue = typeMetrics.length > 0
                      ? typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length
                      : 0;

                    return (
                      <div key={type} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium capitalize">
                            {type.replace(/_/g, ' ')}
                          </span>
                          <Badge variant="outline">
                            {type === 'feedback_latency' ? `${avgValue.toFixed(0)}ms` : `${avgValue.toFixed(1)}%`}
                          </Badge>
                        </div>
                        <Progress 
                          value={type === 'feedback_latency' ? Math.min((avgValue / 10000) * 100, 100) : avgValue} 
                          className="h-2 mb-2" 
                        />
                        <div className="text-xs text-muted-foreground">
                          {typeMetrics.length} measurements • Last updated: {typeMetrics.length > 0 ? new Date(Number(typeMetrics[0].timestamp) / 1000000).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">No adaptive metrics yet</p>
                  <p className="text-xs">
                    Metrics will be collected as the system learns and adapts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status Alert */}
      {avgFeedbackLatency < 10000 && confidenceRate >= 95 ? (
        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-600">
            <strong>Optimal Performance:</strong> Adaptive learning system is operating at peak efficiency with &lt;10s feedback latency and ≥95% confidence rate. Self-improving agentic behavior is active across all agents.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-600">
            <strong>Optimization in Progress:</strong> Adaptive learning system is calibrating. Current feedback latency: {avgFeedbackLatency.toFixed(0)}ms (target: &lt;10s), Confidence rate: {confidenceRate.toFixed(1)}% (target: ≥95%). System will reach optimal performance as more feedback loops complete.
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Implementation Details */}
      <Card className="modern-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Brain className="w-5 h-5" />
            Nano Step 6 Implementation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-600">Continuous Adaptive Intelligence</div>
                <div className="text-xs text-muted-foreground">
                  Agents automatically detect and adapt to recurring anomalies, dynamically tune internal thresholds, and synchronize refinement data through Transparency Dashboard
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <Target className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-purple-600">Semantic Correction Alignment</div>
                <div className="text-xs text-muted-foreground">
                  Adaptive cycles trigger within 10 seconds post-error detection, attaining ≥95% semantic correction alignment across QA and Judge Agents
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-green-600">Self-Improving Agentic Behavior</div>
                <div className="text-xs text-muted-foreground">
                  Transforms Ascend Health from a monitored network into a continuously evolving intelligence mesh ready for Nano Step 7 (Self-Optimization & Cognitive Governance)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveLearningDashboard;
