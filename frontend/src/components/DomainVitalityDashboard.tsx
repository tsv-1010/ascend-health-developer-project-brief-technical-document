import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  TrendingUp, 
  Flame, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Award,
  Target,
  Zap,
  Lock,
  Unlock,
  Heart,
  Apple,
  Brain,
  DollarSign,
  Users,
  Leaf,
  Compass,
  Sparkles,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import { 
  useGetDomainVitalityScores, 
  useCalculateDomainVitality,
  useSubmitDomainVitalityScore,
  useCalculateSynergyCoefficient,
  useGetSynergyCoefficient
} from '../hooks/useQueries';
import { toast } from 'sonner';

const ALL_DOMAINS = [
  { id: 'Fitness', name: 'Fitness', icon: Activity, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'Nutrition', name: 'Nutrition', icon: Apple, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'Longevity', name: 'Longevity', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { id: 'Mental', name: 'Mental/Recovery', icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { id: 'Finance', name: 'Finance', icon: DollarSign, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'Purpose', name: 'Purpose', icon: Compass, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  { id: 'Community', name: 'Community', icon: Users, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { id: 'Environment', name: 'Environment', icon: Leaf, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' }
];

// Mock domain indicators for demonstration
const DOMAIN_INDICATORS: Record<string, Array<{ metricName: string; value: number; min: number; max: number; weight: number }>> = {
  Fitness: [
    { metricName: 'VO2 Max', value: 52.0, min: 40.0, max: 60.0, weight: 0.25 },
    { metricName: 'Heart Rate Variability', value: 75.0, min: 50.0, max: 100.0, weight: 0.20 },
    { metricName: 'Resting HR', value: 65.0, min: 60.0, max: 80.0, weight: 0.10 },
    { metricName: 'Training Load Volume', value: 200.0, min: 150.0, max: 300.0, weight: 0.15 },
    { metricName: 'Recovery Score', value: 85.0, min: 70.0, max: 100.0, weight: 0.15 }
  ],
  Nutrition: [
    { metricName: 'Daily Fiber Intake', value: 35.0, min: 30.0, max: 38.0, weight: 0.20 },
    { metricName: 'Glucose Stability Index', value: 88.0, min: 80.0, max: 100.0, weight: 0.25 },
    { metricName: 'Micronutrient Density Score', value: 82.0, min: 70.0, max: 100.0, weight: 0.20 },
    { metricName: 'Hydration Level', value: 2.8, min: 2.0, max: 3.5, weight: 0.15 },
    { metricName: 'Meal Timing Consistency', value: 78.0, min: 70.0, max: 100.0, weight: 0.20 }
  ],
  Longevity: [
    { metricName: 'Average Sleep Efficiency', value: 90.0, min: 85.0, max: 95.0, weight: 0.25 },
    { metricName: 'Fasting Glucose', value: 82.0, min: 70.0, max: 90.0, weight: 0.30 },
    { metricName: 'Biomarker Trend Analysis', value: 85.0, min: 70.0, max: 100.0, weight: 0.20 },
    { metricName: 'Stress Recovery Rate', value: 80.0, min: 70.0, max: 100.0, weight: 0.15 },
    { metricName: 'Inflammation Markers', value: 1.5, min: 0.0, max: 3.0, weight: 0.10 }
  ],
  Mental: [
    { metricName: 'Stress Level Assessment', value: 18.0, min: 0.0, max: 30.0, weight: 0.25 },
    { metricName: 'Sleep Quality Score', value: 85.0, min: 70.0, max: 100.0, weight: 0.30 },
    { metricName: 'Meditation Consistency', value: 20.0, min: 10.0, max: 30.0, weight: 0.15 },
    { metricName: 'Mood Stability Index', value: 82.0, min: 70.0, max: 100.0, weight: 0.20 },
    { metricName: 'Cognitive Performance Metrics', value: 88.0, min: 70.0, max: 100.0, weight: 0.10 }
  ],
  Finance: [
    { metricName: 'Emergency Fund Ratio', value: 6.0, min: 3.0, max: 12.0, weight: 0.25 },
    { metricName: 'Debt-to-Income Ratio', value: 25.0, min: 0.0, max: 36.0, weight: 0.30 },
    { metricName: 'Investment Diversification Score', value: 75.0, min: 50.0, max: 100.0, weight: 0.20 },
    { metricName: 'Savings Rate', value: 22.0, min: 15.0, max: 30.0, weight: 0.15 },
    { metricName: 'Financial Goal Progress', value: 68.0, min: 50.0, max: 100.0, weight: 0.10 }
  ],
  Purpose: [
    { metricName: 'Goal Alignment Score', value: 82.0, min: 60.0, max: 100.0, weight: 0.30 },
    { metricName: 'Value Consistency Index', value: 88.0, min: 70.0, max: 100.0, weight: 0.25 },
    { metricName: 'Mission Clarity Rating', value: 75.0, min: 60.0, max: 100.0, weight: 0.20 },
    { metricName: 'Impact Measurement', value: 70.0, min: 50.0, max: 100.0, weight: 0.15 },
    { metricName: 'Personal Growth Tracking', value: 78.0, min: 60.0, max: 100.0, weight: 0.10 }
  ],
  Community: [
    { metricName: 'Social Connection Quality', value: 85.0, min: 60.0, max: 100.0, weight: 0.30 },
    { metricName: 'Support Network Strength', value: 78.0, min: 50.0, max: 100.0, weight: 0.25 },
    { metricName: 'Community Engagement Level', value: 72.0, min: 50.0, max: 100.0, weight: 0.20 },
    { metricName: 'Relationship Satisfaction', value: 88.0, min: 60.0, max: 100.0, weight: 0.15 },
    { metricName: 'Social Impact Score', value: 65.0, min: 50.0, max: 100.0, weight: 0.10 }
  ],
  Environment: [
    { metricName: 'Air Quality Exposure', value: 45.0, min: 0.0, max: 50.0, weight: 0.30 },
    { metricName: 'Water Quality Score', value: 88.0, min: 70.0, max: 100.0, weight: 0.25 },
    { metricName: 'Living Space Organization', value: 75.0, min: 50.0, max: 100.0, weight: 0.20 },
    { metricName: 'Natural Light Exposure', value: 6.5, min: 4.0, max: 8.0, weight: 0.15 },
    { metricName: 'Environmental Toxin Reduction', value: 82.0, min: 60.0, max: 100.0, weight: 0.10 }
  ]
};

const DomainVitalityDashboard: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('Fitness');
  const [unlockedDomains, setUnlockedDomains] = useState<string[]>(['Fitness', 'Nutrition', 'Longevity', 'Mental']);
  const { data: vitalityScores = [], isLoading } = useGetDomainVitalityScores();
  const { data: synergyCoefficient } = useGetSynergyCoefficient();
  const { mutate: calculateVitality, isPending: calculating } = useCalculateDomainVitality();
  const { mutate: submitDomainScore } = useSubmitDomainVitalityScore();
  const { mutate: calculateSynergy, isPending: calculatingSynergy } = useCalculateSynergyCoefficient();

  const selectedDomainConfig = ALL_DOMAINS.find(d => d.id === selectedDomain);
  const DomainIcon = selectedDomainConfig?.icon || Activity;

  // Auto-calculate synergy when domains are unlocked or scores change
  useEffect(() => {
    if (unlockedDomains.length >= 2 && vitalityScores.length > 0) {
      // Auto-submit domain scores and calculate synergy
      const timer = setTimeout(() => {
        calculateSynergy(undefined, {
          onSuccess: (result) => {
            console.log('Synergy coefficient calculated:', result);
          },
          onError: (error) => {
            console.error('Failed to calculate synergy:', error);
          }
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [unlockedDomains.length, vitalityScores.length]);

  const handleCalculateVitality = (domainId: string) => {
    const indicators = DOMAIN_INDICATORS[domainId] || [];
    
    const mockIndicators = indicators.map(ind => ({
      metricName: ind.metricName,
      value: ind.value,
      timestamp: BigInt(Date.now())
    }));

    const mockStandards: Array<[string, number, number, number]> = indicators.map(ind => [
      ind.metricName,
      ind.min,
      ind.max,
      ind.weight
    ]);

    const mockUserGoals: Array<[string, number]> = indicators.slice(0, 3).map(ind => [
      ind.metricName,
      (ind.min + ind.max) / 2
    ]);

    calculateVitality({
      indicators: mockIndicators,
      standards: mockStandards,
      userGoals: mockUserGoals,
      alpha: 1.0,
      gamma: 1.0,
      deltaMaintenance: 0.0
    }, {
      onSuccess: (result) => {
        toast.success(`${domainId} vitality calculated: ${result.vitality.vitalityScore.toFixed(1)}`, {
          description: result.isMaintenanceActive 
            ? `🔥 Maintenance mode active! ${result.maintenanceStatus.consecutiveOptimalDays} days streak`
            : 'Keep up the great work!'
        });

        // Submit domain score to ProofOfLife canister
        submitDomainScore({
          domain: domainId,
          score: result.vitality.vitalityScore,
          isActive: unlockedDomains.includes(domainId)
        });
      },
      onError: (error) => {
        toast.error(`Failed to calculate vitality: ${error.message}`);
      }
    });
  };

  const handleUnlockDomain = (domainId: string) => {
    if (!unlockedDomains.includes(domainId)) {
      setUnlockedDomains([...unlockedDomains, domainId]);
      toast.success(`${domainId} domain unlocked!`, {
        description: 'You can now track vitality scores for this domain'
      });
    }
  };

  const handleCalculateSynergy = () => {
    calculateSynergy(undefined, {
      onSuccess: (result) => {
        toast.success(`Synergy coefficient calculated: ${result.normalizedSynergy.toFixed(3)}`, {
          description: `Balance across ${result.activeDomainCount} active domains`
        });
      },
      onError: (error) => {
        toast.error(`Failed to calculate synergy: ${error.message}`);
      }
    });
  };

  const latestScore = vitalityScores.length > 0 ? vitalityScores[vitalityScores.length - 1] : null;
  const maintenanceActive = latestScore?.maintenanceStatus?.isActive || false;
  const consecutiveDays = latestScore?.maintenanceStatus?.consecutiveOptimalDays || 0;

  // Synergy visualization helpers
  const getSynergyStatus = (sigma: number) => {
    if (sigma >= 0.9) return { label: 'Excellent Balance', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    if (sigma >= 0.7) return { label: 'Good Balance', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    if (sigma >= 0.5) return { label: 'Moderate Imbalance', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    return { label: 'High Imbalance', color: 'text-red-500', bgColor: 'bg-red-500/10' };
  };

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardContent className="py-12 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading vitality scores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="modern-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Proof of Vitality 2.0 - Sprint 3: Synergy</CardTitle>
                <CardDescription>
                  Inter-domain balance measurement with synergy coefficient (σ)
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_DOMAINS.map(domain => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center gap-2">
                        <domain.icon className={`w-4 h-4 ${domain.color}`} />
                        {domain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => handleCalculateVitality(selectedDomain)}
                disabled={calculating || !unlockedDomains.includes(selectedDomain)}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {calculating ? 'Calculating...' : 'Calculate Vitality'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Synergy Coefficient Display */}
          {synergyCoefficient && unlockedDomains.length >= 2 && (
            <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Synergy Coefficient (σ)</CardTitle>
                      <CardDescription>
                        Balance measurement across {synergyCoefficient.activeDomainCount} active domains
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCalculateSynergy}
                    disabled={calculatingSynergy}
                    variant="outline"
                    size="sm"
                  >
                    {calculatingSynergy ? 'Calculating...' : 'Recalculate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Synergy (σ)</div>
                      <div className="text-4xl font-bold text-primary">
                        {synergyCoefficient.normalizedSynergy.toFixed(3)}
                      </div>
                      <Progress value={synergyCoefficient.normalizedSynergy * 100} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Mean Score</div>
                      <div className="text-4xl font-bold text-blue-500">
                        {synergyCoefficient.meanScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Average across domains</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Std Deviation</div>
                      <div className="text-4xl font-bold text-purple-500">
                        {synergyCoefficient.standardDeviation.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Score variance</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Balance Status</div>
                      <Badge className={`${getSynergyStatus(synergyCoefficient.normalizedSynergy).bgColor} ${getSynergyStatus(synergyCoefficient.normalizedSynergy).color} text-sm py-2 px-3`}>
                        {getSynergyStatus(synergyCoefficient.normalizedSynergy).label}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {synergyCoefficient.normalizedSynergy < 0.7 && (
                  <Alert className="border-amber-500/50 bg-amber-500/10 mb-4">
                    <TrendingDown className="h-5 w-5 text-amber-500" />
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      <strong>Imbalance Detected:</strong> Your health scores show significant variance across domains. 
                      Focus on improving lower-scoring domains to achieve better overall balance and synergy.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Active Domain Scores
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {synergyCoefficient.activeDomainScores.map((domainScore, index) => {
                      const domainConfig = ALL_DOMAINS.find(d => d.id === domainScore.domain);
                      const DomainIconComponent = domainConfig?.icon || Activity;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div className="flex items-center gap-2">
                            <DomainIconComponent className={`w-4 h-4 ${domainConfig?.color}`} />
                            <span className="text-sm font-medium">{domainScore.domain}</span>
                          </div>
                          <span className="text-sm font-bold text-primary">{domainScore.score.toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Synergy Formula
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    The synergy coefficient rewards balanced health across all active domains:
                  </p>
                  <code className="block p-3 bg-background rounded text-xs font-mono">
                    σ = 1 - (stddev / 100)
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Where σ = 1 represents perfect balance (all domains equal), and lower values indicate imbalance.
                    Only active/unlocked domains are included in the calculation.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Domain Grid Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {ALL_DOMAINS.map(domain => {
              const isUnlocked = unlockedDomains.includes(domain.id);
              const DomainIconComponent = domain.icon;
              
              return (
                <Card 
                  key={domain.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedDomain === domain.id 
                      ? 'border-primary shadow-lg' 
                      : 'border-border/50'
                  } ${!isUnlocked ? 'opacity-50' : ''}`}
                  onClick={() => isUnlocked && setSelectedDomain(domain.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`p-3 ${domain.bgColor} rounded-xl inline-block mb-2`}>
                      <DomainIconComponent className={`w-6 h-6 ${domain.color}`} />
                    </div>
                    <div className="text-sm font-medium mb-1">{domain.name}</div>
                    {isUnlocked ? (
                      <Badge variant="outline" className="text-xs">
                        <Unlock className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockDomain(domain.id);
                        }}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Unlock
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!unlockedDomains.includes(selectedDomain) && (
            <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
              <Lock className="h-5 w-5 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-lg">Domain Locked</strong>
                    <p className="mt-1">Unlock {selectedDomain} to start tracking vitality scores for this domain.</p>
                  </div>
                  <Button 
                    onClick={() => handleUnlockDomain(selectedDomain)}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {maintenanceActive && unlockedDomains.includes(selectedDomain) && (
            <Alert className="mb-6 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
              <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-lg">🔥 Maintenance Mode Active!</strong>
                    <p className="mt-1">You've maintained optimal performance for <strong>{consecutiveDays} consecutive days</strong>. Keep up the amazing work!</p>
                  </div>
                  <Badge className="bg-amber-500 text-white ml-4">
                    <Flame className="w-3 h-3 mr-1" />
                    {consecutiveDays} Day Streak
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="indicators" className="rounded-lg">Indicators</TabsTrigger>
              <TabsTrigger value="maintenance" className="rounded-lg">Maintenance</TabsTrigger>
              <TabsTrigger value="synergy" className="rounded-lg">Synergy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              {unlockedDomains.includes(selectedDomain) ? (
                latestScore ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DomainIcon className={`w-5 h-5 ${selectedDomainConfig?.color}`} />
                          {selectedDomain} Vitality Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-5xl font-bold text-primary mb-2">
                          {latestScore.vitality.vitalityScore.toFixed(1)}
                        </div>
                        <Progress value={latestScore.vitality.vitalityScore} className="h-3 mb-3" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Last updated: {new Date(Number(latestScore.vitality.timestamp) / 1000000).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Performance Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Domain</span>
                          <Badge variant="outline">{latestScore.vitality.domain}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Tracked Indicators</span>
                          <Badge className="bg-primary">{latestScore.vitality.indicators.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Maintenance Mode</span>
                          {maintenanceActive ? (
                            <Badge className="bg-amber-500">
                              <Flame className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No vitality scores calculated yet for {selectedDomain}</p>
                    <Button onClick={() => handleCalculateVitality(selectedDomain)} disabled={calculating}>
                      <Zap className="w-4 h-4 mr-2" />
                      Calculate Your First Score
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Unlock {selectedDomain} to view vitality scores</p>
                  <Button onClick={() => handleUnlockDomain(selectedDomain)}>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Domain
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="indicators" className="space-y-4 mt-6">
              {unlockedDomains.includes(selectedDomain) ? (
                latestScore ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {latestScore.vitality.indicators.map((indicator, index) => (
                      <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{indicator.metricName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Raw Value</span>
                              <span className="font-medium">{indicator.rawValue.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Objective Score</span>
                              <span className="font-medium text-blue-600">{indicator.objectiveNormalized.toFixed(1)}/100</span>
                            </div>
                            <Progress value={indicator.objectiveNormalized} className="h-2" />
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Subjective Score</span>
                              <span className="font-medium text-purple-600">{indicator.subjectiveNormalized.toFixed(1)}/100</span>
                            </div>
                            <Progress value={indicator.subjectiveNormalized} className="h-2" />
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Weight</span>
                              <Badge variant="outline" className="text-xs">{indicator.weight.toFixed(2)}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No indicator data available for {selectedDomain}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Unlock {selectedDomain} to view indicators</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4 mt-6">
              {unlockedDomains.includes(selectedDomain) ? (
                latestScore?.maintenanceStatus ? (
                  <div className="space-y-6">
                    <Card className={`border-2 ${maintenanceActive ? 'border-amber-500 bg-amber-500/5' : 'border-border/50'}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {maintenanceActive ? (
                            <>
                              <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                              Maintenance Mode Active
                            </>
                          ) : (
                            <>
                              <Target className="w-6 h-6 text-muted-foreground" />
                              Maintenance Mode Inactive
                            </>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {maintenanceActive 
                            ? 'All indicators are within optimal ranges for 30+ consecutive days'
                            : 'Maintain optimal performance across all indicators for 30 days to activate'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-background rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Consecutive Days</div>
                            <div className="text-3xl font-bold text-primary">
                              {consecutiveDays}
                            </div>
                            <Progress value={(consecutiveDays / 30) * 100} className="h-2 mt-2" />
                          </div>
                          <div className="p-4 bg-background rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Status</div>
                            <div className="text-2xl font-bold">
                              {maintenanceActive ? (
                                <Badge className="bg-amber-500 text-white">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-4 bg-background rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Progress to 30 Days</div>
                            <div className="text-3xl font-bold text-primary">
                              {Math.min(100, Math.round((consecutiveDays / 30) * 100))}%
                            </div>
                          </div>
                        </div>

                        {latestScore.maintenanceStatus.activationTimestamp && (
                          <Alert className="border-green-500/50 bg-green-500/10">
                            <Award className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700 dark:text-green-300">
                              <strong>Maintenance mode activated on:</strong>{' '}
                              {new Date(Number(latestScore.maintenanceStatus.activationTimestamp) / 1000000).toLocaleDateString()}
                            </AlertDescription>
                          </Alert>
                        )}

                        {latestScore.maintenanceStatus.lastResetTimestamp && !maintenanceActive && (
                          <Alert className="border-orange-500/50 bg-orange-500/10">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <AlertDescription className="text-orange-700 dark:text-orange-300">
                              <strong>Last reset:</strong>{' '}
                              {new Date(Number(latestScore.maintenanceStatus.lastResetTimestamp) / 1000000).toLocaleDateString()}
                              {' - One or more indicators fell outside optimal ranges'}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            Maintenance Scoring Formula
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            When maintenance mode is active, your vitality score uses a special formula that rewards sustained optimal performance:
                          </p>
                          <code className="block p-3 bg-background rounded text-xs font-mono">
                            V = (α × A<sub>streak</sub>) + (γ × M<sub>raw</sub>) + δ<sub>maintenance</sub>
                          </code>
                          <p className="text-xs text-muted-foreground mt-2">
                            Where A<sub>streak</sub> is your consecutive optimal days, M<sub>raw</sub> is your raw performance score, 
                            and δ<sub>maintenance</sub> is a bonus for maintaining excellence.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Maintenance Criteria</CardTitle>
                        <CardDescription>
                          All indicators must remain within optimal ranges from Central Standards Memory
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {latestScore.vitality.indicators.map((indicator, index) => {
                            const isOptimal = indicator.objectiveNormalized >= 85;
                            return (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                <span className="text-sm font-medium">{indicator.metricName}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {indicator.objectiveNormalized.toFixed(1)}/100
                                  </span>
                                  {isOptimal ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No maintenance status data available for {selectedDomain}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Unlock {selectedDomain} to view maintenance status</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="synergy" className="space-y-4 mt-6">
              {synergyCoefficient && unlockedDomains.length >= 2 ? (
                <div className="space-y-6">
                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      <strong>Sprint 3 Complete:</strong> Synergy coefficient (σ) calculation rewards balanced health across all active domains. 
                      The coefficient ranges from 0 to 1, where 1 represents perfect balance and lower values indicate imbalance between domains.
                    </AlertDescription>
                  </Alert>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Synergy Calculation Details</CardTitle>
                      <CardDescription>
                        Standard deviation-based balance measurement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Formula Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-muted-foreground">Active Domains</span>
                            <span className="font-medium">{synergyCoefficient.activeDomainCount}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-muted-foreground">Mean Score (μ)</span>
                            <span className="font-medium">{synergyCoefficient.meanScore.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-muted-foreground">Standard Deviation (σ<sub>raw</sub>)</span>
                            <span className="font-medium">{synergyCoefficient.standardDeviation.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-primary/10 rounded border border-primary/30">
                            <span className="font-medium">Normalized Synergy (σ)</span>
                            <span className="font-bold text-primary">{synergyCoefficient.normalizedSynergy.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/20 rounded-lg">
                        <h4 className="font-medium mb-2">Interpretation Guide</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span><strong>σ ≥ 0.9:</strong> Excellent balance - all domains performing similarly</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span><strong>0.7 ≤ σ &lt; 0.9:</strong> Good balance - minor variations acceptable</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span><strong>0.5 ≤ σ &lt; 0.7:</strong> Moderate imbalance - focus on weaker domains</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span><strong>σ &lt; 0.5:</strong> High imbalance - significant improvement needed</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Calculation Timestamp</h4>
                        <p className="text-sm text-muted-foreground">
                          Last calculated: {new Date(Number(synergyCoefficient.calculationTimestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {unlockedDomains.length < 2 
                      ? 'Unlock at least 2 domains to calculate synergy coefficient'
                      : 'No synergy coefficient calculated yet'}
                  </p>
                  {unlockedDomains.length >= 2 && (
                    <Button onClick={handleCalculateSynergy} disabled={calculatingSynergy}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Calculate Synergy
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert className="border-blue-500/50 bg-blue-500/10">
        <CheckCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <strong>Proof of Vitality 2.0 - Sprint 3:</strong> Inter-domain synergy computation now active! The synergy coefficient (σ) measures balance across all active domains using standard deviation. Perfect balance (σ = 1) rewards holistic health optimization, while imbalance (σ &lt; 0.7) highlights areas needing attention.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DomainVitalityDashboard;
