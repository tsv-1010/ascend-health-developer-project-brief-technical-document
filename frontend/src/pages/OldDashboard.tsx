import React, { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetCallerUserProfile, useGetDomainProgress, useGetBadges, useGetCustomMetrics, useCreateCustomMetric } from '../hooks/useQueries';
import { HealthDomain, CustomMetric } from '../backend';
import Header from '../components/Header';
import FloatingAgent from '../components/FloatingAgent';
import WearableConnectionHub from '../components/WearableConnectionHub';
import HealthRecordsUpload from '../components/HealthRecordsUpload';
import { 
  Trophy, 
  Flame, 
  Plus, 
  TrendingUp, 
  Activity, 
  Apple, 
  Brain, 
  DollarSign, 
  Users, 
  Leaf, 
  Target, 
  Heart, 
  Volume2, 
  Zap, 
  Droplets, 
  Moon, 
  Upload, 
  Watch, 
  Smartphone,
  Filter,
  BarChart3,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Building2,
  Database,
  Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendDataPoint {
  date: string;
  score: number;
  steps: number;
  hrv: number;
  glucose: number;
  sleep: number;
}

interface DataSource {
  id: string;
  name: string;
  type: 'wearable' | 'lab' | 'manual';
  connected: boolean;
  lastSync?: Date;
  icon: React.ComponentType<any>;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: domainProgress = [] } = useGetDomainProgress();
  const { data: badges = [] } = useGetBadges();
  const { data: customMetrics = [] } = useGetCustomMetrics();
  const createCustomMetric = useCreateCustomMetric();

  const [isCreateMetricOpen, setIsCreateMetricOpen] = useState(false);
  const [isWearableHubOpen, setIsWearableHubOpen] = useState(false);
  const [isHealthRecordsOpen, setIsHealthRecordsOpen] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');
  const [newMetricDomain, setNewMetricDomain] = useState<HealthDomain | ''>('');
  const [trendPeriod, setTrendPeriod] = useState<'30' | '90'>('30');
  const [dataSourceFilter, setDataSourceFilter] = useState<'all' | 'wearable' | 'lab' | 'manual'>('all');
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  const domains = [
    { 
      name: HealthDomain.fitness, 
      title: 'Fitness', 
      color: 'from-green-400 to-emerald-500',
      icon: Activity,
      orbImage: '/assets/generated/fitness-orb-small.png'
    },
    { 
      name: HealthDomain.nutrition, 
      title: 'Nutrition', 
      color: 'from-orange-400 to-red-500',
      icon: Apple,
      orbImage: '/assets/generated/nutrition-orb-small.png'
    },
    { 
      name: HealthDomain.mental, 
      title: 'Mental Health', 
      color: 'from-blue-400 to-indigo-500',
      icon: Brain,
      orbImage: '/assets/generated/mental-orb-small.png'
    },
    { 
      name: HealthDomain.finances, 
      title: 'Finances', 
      color: 'from-yellow-400 to-orange-500',
      icon: DollarSign,
      orbImage: '/assets/generated/finances-orb-small.png'
    },
    { 
      name: HealthDomain.community, 
      title: 'Community', 
      color: 'from-purple-400 to-pink-500',
      icon: Users,
      orbImage: '/assets/generated/community-orb-small.png'
    },
    { 
      name: HealthDomain.environment, 
      title: 'Environment', 
      color: 'from-teal-400 to-cyan-500',
      icon: Leaf,
      orbImage: '/assets/generated/environment-orb-small.png'
    },
    { 
      name: HealthDomain.purpose, 
      title: 'Purpose', 
      color: 'from-red-400 to-pink-500',
      icon: Target,
      orbImage: '/assets/generated/purpose-orb-small.png'
    },
    { 
      name: HealthDomain.longevity, 
      title: 'Longevity', 
      color: 'from-gray-400 to-slate-500',
      icon: Heart,
      orbImage: '/assets/generated/longevity-orb-small.png'
    },
  ];

  // Enhanced data sources
  const dataSources: DataSource[] = [
    { id: 'oura', name: 'Oura Ring', type: 'wearable', connected: true, lastSync: new Date(Date.now() - 15 * 60 * 1000), icon: Watch },
    { id: 'whoop', name: 'WHOOP Strap', type: 'wearable', connected: true, lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), icon: Activity },
    { id: 'apple-health', name: 'Apple Health', type: 'wearable', connected: false, icon: Smartphone },
    { id: 'function-health', name: 'Function Health', type: 'lab', connected: false, icon: Stethoscope },
    { id: 'lab-upload', name: 'Lab Results Upload', type: 'lab', connected: true, lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), icon: Upload },
    { id: 'manual-entry', name: 'Manual Entry', type: 'manual', connected: true, icon: Database }
  ];

  const getDomainProgress = (domain: HealthDomain) => {
    const progress = domainProgress.find(([d]) => d === domain);
    return progress ? progress[1] : { score: BigInt(0), streak: BigInt(0), lastUpdated: BigInt(Date.now()) };
  };

  const calculateOverallScore = () => {
    if (domainProgress.length === 0) return 0;
    const totalScore = domainProgress.reduce((sum, [, progress]) => sum + Number(progress.score), 0);
    return Math.round(totalScore / domainProgress.length);
  };

  const getHealthCoreGradient = (score: number) => {
    if (score < 30) return 'from-red-500 via-red-600 to-red-700';
    if (score < 60) return 'from-orange-500 via-yellow-500 to-orange-600';
    return 'from-green-500 via-emerald-500 to-green-600';
  };

  const navigate = (path: string) => {
    router.navigate({ to: path });
  };

  const handleCreateMetric = async () => {
    if (!newMetricName.trim() || !newMetricValue.trim() || !newMetricDomain) {
      toast.error('Please fill in all fields');
      return;
    }

    const value = parseInt(newMetricValue);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    try {
      const metric: CustomMetric = {
        id: `custom_${Date.now()}`,
        name: newMetricName.trim(),
        value: BigInt(value),
        domain: newMetricDomain,
        createdAt: BigInt(Date.now())
      };

      await createCustomMetric.mutateAsync(metric);
      toast.success('Custom metric created successfully!');
      setIsCreateMetricOpen(false);
      setNewMetricName('');
      setNewMetricValue('');
      setNewMetricDomain('');
    } catch (error) {
      toast.error('Failed to create custom metric');
    }
  };

  const speakHealthScore = () => {
    const overallScore = calculateOverallScore();
    const lastWeekScore = Math.max(0, overallScore - Math.floor(Math.random() * 10) + 5);
    const change = overallScore - lastWeekScore;
    const changeText = change > 0 ? `up ${change}%` : change < 0 ? `down ${Math.abs(change)}%` : 'unchanged';
    
    const connectedSources = dataSources.filter(s => s.connected).length;
    const message = `Your health score is ${overallScore}—${changeText} from last week. You have ${connectedSources} data sources connected, including wearables and lab results. ${overallScore >= 80 ? 'Excellent work!' : overallScore >= 60 ? 'Good progress!' : 'Keep pushing forward!'}`;
    
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
        toast.success('Health score summary spoken');
      } catch (error) {
        toast.error('Text-to-speech not available');
      }
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  // Enhanced trend data generation
  const generateTrendData = (days: number): TrendDataPoint[] => {
    const data: TrendDataPoint[] = [];
    const baseScore = calculateOverallScore();
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = Math.sin(i * 0.1) * 10 + Math.random() * 8 - 4;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.max(0, Math.min(100, baseScore + variation)),
        steps: 8000 + Math.floor(Math.random() * 4000),
        hrv: 40 + Math.floor(Math.random() * 20),
        glucose: 85 + Math.floor(Math.random() * 30),
        sleep: 6.5 + Math.random() * 2,
      });
    }
    return data;
  };

  const trendData = generateTrendData(parseInt(trendPeriod));
  const overallScore = calculateOverallScore();

  // Enhanced key metrics with comprehensive benchmarking
  const keyMetrics = [
    {
      name: 'Daily Steps',
      value: 8542,
      target: 10000,
      unit: '',
      standard: 'CDC: 10,000 steps/day',
      benchmark: { organization: 'CDC', value: 10000, status: 'below' },
      source: 'Oura Ring',
      sourceType: 'wearable' as const,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      domain: HealthDomain.fitness
    },
    {
      name: 'HRV Score',
      value: 45,
      target: 50,
      unit: 'ms',
      standard: 'Optimal: >50ms',
      benchmark: { organization: 'HRV Research', value: 50, status: 'below' },
      source: 'WHOOP Strap',
      sourceType: 'wearable' as const,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      domain: HealthDomain.fitness
    },
    {
      name: 'Fasting Glucose',
      value: 92,
      target: 100,
      unit: 'mg/dL',
      standard: 'ADA: <100 mg/dL',
      benchmark: { organization: 'ADA', value: 100, status: 'optimal' },
      source: 'Lab Results',
      sourceType: 'lab' as const,
      icon: Droplets,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      domain: HealthDomain.nutrition
    },
    {
      name: 'Sleep Efficiency',
      value: 82,
      target: 85,
      unit: '%',
      standard: 'Sleep Medicine: >85%',
      benchmark: { organization: 'Sleep Medicine', value: 85, status: 'below' },
      source: 'Oura Ring',
      sourceType: 'wearable' as const,
      icon: Moon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      domain: HealthDomain.mental
    },
    {
      name: 'VO2 Max',
      value: 48,
      target: 50,
      unit: 'ml/kg/min',
      standard: 'ACSM: >50 (Excellent)',
      benchmark: { organization: 'ACSM', value: 50, status: 'below' },
      source: 'Apple Health',
      sourceType: 'wearable' as const,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      domain: HealthDomain.fitness
    },
    {
      name: 'Total Cholesterol',
      value: 185,
      target: 200,
      unit: 'mg/dL',
      standard: 'AHA: <200 mg/dL',
      benchmark: { organization: 'AHA', value: 200, status: 'optimal' },
      source: 'Lab Upload',
      sourceType: 'lab' as const,
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      domain: HealthDomain.longevity
    },
    {
      name: 'Portfolio Yield',
      value: 8.5,
      target: 7.0,
      unit: '%',
      standard: 'Target: 7% annually',
      benchmark: { organization: 'Financial Planning', value: 7, status: 'above' },
      source: 'Manual Entry',
      sourceType: 'manual' as const,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      domain: HealthDomain.finances
    },
    {
      name: 'Vitamin D',
      value: 32,
      target: 30,
      unit: 'ng/mL',
      standard: 'Endocrine Society: >30',
      benchmark: { organization: 'Endocrine Society', value: 30, status: 'optimal' },
      source: 'Lab Results',
      sourceType: 'lab' as const,
      icon: Heart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      domain: HealthDomain.longevity
    }
  ];

  // Filter metrics based on data source
  const filteredMetrics = keyMetrics.filter(metric => {
    if (dataSourceFilter === 'all') return true;
    return metric.sourceType === dataSourceFilter;
  });

  const getBenchmarkIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'above': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'below': return <TrendingDown className="w-3 h-3 text-orange-500" />;
      case 'critical': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default: return <CheckCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Enhanced Header with TTS */}
        <div className="text-center space-y-6 animate-slide-up">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <img 
                src="/assets/generated/ascend-health-logo.png" 
                alt="Ascend Health"
                className="w-16 h-16 rounded-3xl shadow-soft"
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse-glow flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl font-black gradient-text">
                Hello, {userProfile?.name}! 👋
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={speakHealthScore}
                className="mt-2 text-muted-foreground hover:text-primary"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Hear your integrated health summary
              </Button>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your AI wellness companion <span className="font-semibold text-accent">{userProfile?.agentName}</span> has integrated data from {dataSources.filter(s => s.connected).length} sources.
          </p>
        </div>

        {/* Enhanced Health Data Integration Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Dialog open={isWearableHubOpen} onOpenChange={setIsWearableHubOpen}>
            <DialogTrigger asChild>
              <Card className="modern-card cursor-pointer hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50 dark:from-blue-950/20 dark:via-blue-900/10 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <Watch className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Wearable Integration Hub</CardTitle>
                  <p className="text-muted-foreground">OAuth2 authentication with encrypted token storage</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {dataSources.filter(s => s.type === 'wearable' && s.connected).length} Connected
                    </Badge>
                    <Badge variant="outline">{dataSources.filter(s => s.type === 'wearable').length} Available</Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Encrypted
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Wearable Integration Hub</DialogTitle>
              </DialogHeader>
              <WearableConnectionHub />
            </DialogContent>
          </Dialog>

          <Dialog open={isHealthRecordsOpen} onOpenChange={setIsHealthRecordsOpen}>
            <DialogTrigger asChild>
              <Card className="modern-card cursor-pointer hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-purple-50 via-purple-25 to-pink-50 dark:from-purple-950/20 dark:via-purple-900/10 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">AI Health Records Portal</CardTitle>
                  <p className="text-muted-foreground">OCR processing with benchmark analysis</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      AI-Powered OCR
                    </Badge>
                    <Badge variant="outline">Benchmark Mapping</Badge>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Encrypted
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Health Records Portal</DialogTitle>
              </DialogHeader>
              <HealthRecordsUpload />
            </DialogContent>
          </Dialog>
        </div>

        {/* Health Core and Orbiting Domains */}
        <div className="relative flex flex-col items-center space-y-12 animate-scale-in">
          {/* Central Health Core Orb */}
          <div className="relative health-core-container">
            <div className={`health-core w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br ${getHealthCoreGradient(overallScore)} shadow-glow-lg flex items-center justify-center relative overflow-hidden`}>
              <img 
                src="/assets/generated/health-orb-central.png" 
                alt="Health Core"
                className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-full opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl sm:text-6xl font-black mb-2">{overallScore}</div>
                  <div className="text-sm sm:text-lg font-semibold opacity-90">Integrated Score</div>
                </div>
              </div>
              {/* Dynamic pulse rings */}
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
              <div className="absolute inset-4 rounded-full border-2 border-white/10 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 rounded-full border border-white/5 animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Orbiting Domain Spheres */}
          <div className="relative w-full max-w-5xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 items-center justify-items-center">
              {domains.map((domain, index) => {
                const progress = getDomainProgress(domain.name);
                const Icon = domain.icon;
                return (
                  <div
                    key={domain.name}
                    className={`orbiting-domain relative cursor-pointer transition-all duration-500 hover:scale-110 group`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                    onClick={() => navigate(`/domain/${domain.name}`)}
                  >
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${domain.color} shadow-soft flex items-center justify-center relative overflow-hidden group-hover:shadow-glow transition-all duration-300`}>
                      <img 
                        src={domain.orbImage} 
                        alt={domain.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 group-hover:text-white transition-colors" />
                      </div>
                      {/* Progress ring */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="2"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth="2"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - Number(progress.score) / 100)}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="text-center mt-3">
                      <div className="text-xs sm:text-sm font-semibold text-foreground">{domain.title}</div>
                      <div className="text-xs text-muted-foreground">{Number(progress.score)}/100</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Integrated Health Metrics with Benchmarking */}
        <Card className="modern-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Integrated Health Metrics</CardTitle>
              <p className="text-muted-foreground">Comprehensive data from wearables, lab results, and manual entries with industry benchmarks</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dataSourceFilter} onValueChange={(value) => setDataSourceFilter(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="wearable">Wearables</SelectItem>
                  <SelectItem value="lab">Lab Results</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBenchmarks(!showBenchmarks)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showBenchmarks ? 'Hide' : 'Show'} Benchmarks
              </Button>
              <Dialog open={isCreateMetricOpen} onOpenChange={setIsCreateMetricOpen}>
                <DialogTrigger asChild>
                  <Button className="modern-button bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Metric
                  </Button>
                </DialogTrigger>
                <DialogContent className="modern-card">
                  <DialogHeader>
                    <DialogTitle>Create Custom Metric</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="metric-name">Metric Name</Label>
                      <Input
                        id="metric-name"
                        value={newMetricName}
                        onChange={(e) => setNewMetricName(e.target.value)}
                        placeholder="e.g., Daily Water Intake"
                        className="modern-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="metric-value">Value</Label>
                      <Input
                        id="metric-value"
                        type="number"
                        value={newMetricValue}
                        onChange={(e) => setNewMetricValue(e.target.value)}
                        placeholder="e.g., 8"
                        className="modern-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="metric-domain">Domain</Label>
                      <Select value={newMetricDomain} onValueChange={(value) => setNewMetricDomain(value as HealthDomain)}>
                        <SelectTrigger className="modern-input">
                          <SelectValue placeholder="Select a domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain.name} value={domain.name}>
                              {domain.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleCreateMetric}
                        disabled={createCustomMetric.isPending}
                        className="modern-button flex-1"
                      >
                        {createCustomMetric.isPending ? 'Creating...' : 'Create Metric'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateMetricOpen(false)}
                        className="modern-button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMetrics.slice(0, 6).map((metric, index) => {
                const Icon = metric.icon;
                const percentage = (metric.value / metric.target) * 100;
                const isGood = metric.benchmark.status === 'optimal' || metric.benchmark.status === 'above';
                
                return (
                  <div
                    key={metric.name}
                    className={`p-4 sm:p-6 rounded-2xl ${metric.bgColor} border border-border/50 transition-all duration-300 hover:scale-105`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-xl ${metric.bgColor} border border-border/30`}>
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isGood ? "default" : "secondary"}
                          className={`text-xs ${isGood ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}`}
                        >
                          {getBenchmarkIcon(metric.benchmark.status)}
                          <span className="ml-1">{metric.benchmark.status}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {metric.sourceType}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm sm:text-base">{metric.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-foreground">
                          {metric.value}
                        </span>
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-border/30 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${isGood ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{metric.standard}</span>
                        <Badge variant="outline" className="text-xs">
                          {metric.source}
                        </Badge>
                      </div>
                      
                      {/* Enhanced benchmark information */}
                      {showBenchmarks && (
                        <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-1 text-xs">
                            <Building2 className="w-3 h-3" />
                            <span className="font-medium">{metric.benchmark.organization}</span>
                            <span>•</span>
                            <span>Target: {metric.benchmark.value}{metric.unit}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Time-series Trend Chart with Source Filtering */}
        <Card className="modern-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Integrated Health Trends</CardTitle>
                <p className="text-muted-foreground">Multi-source data visualization with benchmark comparisons</p>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={trendPeriod} onValueChange={(value) => setTrendPeriod(value as '30' | '90')}>
                  <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                    <TabsTrigger value="30">30 Days</TabsTrigger>
                    <TabsTrigger value="90">90 Days</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Sources
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'oklch(var(--card))',
                      border: '1px solid oklch(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="oklch(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'oklch(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'oklch(var(--primary))', strokeWidth: 2 }}
                    name="Health Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="steps" 
                    stroke="oklch(var(--accent))" 
                    strokeWidth={2}
                    dot={false}
                    name="Steps (scaled)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Enhanced AI-generated summary with multi-source insights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">AI Insight with Multi-Source Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Your Oura Ring shows improved sleep efficiency (+12%) while WHOOP indicates optimal recovery. 
                    Recent lab results confirm healthy glucose levels (92 mg/dL vs ADA standard &lt;100). 
                    Your integrated health score has increased 8% this month across {dataSources.filter(s => s.connected).length} connected sources. 
                    Focus on increasing daily steps to reach the CDC recommendation of 10,000! 🎯
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Summary with Data Source Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card className="modern-card bg-gradient-to-br from-orange-50 via-orange-25 to-red-50 dark:from-orange-950/20 dark:via-orange-900/10 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Total Streak</CardTitle>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 streak-flame" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl sm:text-4xl font-black text-orange-600">
                {domainProgress.reduce((sum, [, progress]) => sum + Number(progress.streak), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Days of consistency</p>
            </CardContent>
          </Card>

          <Card className="modern-card bg-gradient-to-br from-yellow-50 via-yellow-25 to-orange-50 dark:from-yellow-950/20 dark:via-yellow-900/10 dark:to-orange-950/20 border-yellow-200/50 dark:border-yellow-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Achievements</CardTitle>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl sm:text-4xl font-black text-yellow-600">{badges.length}</div>
              <p className="text-sm text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>

          <Card className="modern-card bg-gradient-to-br from-green-50 via-green-25 to-emerald-50 dark:from-green-950/20 dark:via-green-900/10 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Data Sources</CardTitle>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                <Database className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl sm:text-4xl font-black text-green-600">{dataSources.filter(s => s.connected).length}</div>
              <p className="text-sm text-muted-foreground">Connected sources</p>
            </CardContent>
          </Card>

          <Card className="modern-card bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50 dark:from-blue-950/20 dark:via-blue-900/10 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Benchmarks</CardTitle>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl sm:text-4xl font-black text-blue-600">
                {keyMetrics.filter(m => m.benchmark.status === 'optimal' || m.benchmark.status === 'above').length}
              </div>
              <p className="text-sm text-muted-foreground">Meeting standards</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Badges */}
        {badges.length > 0 && (
          <Card className="modern-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                Recent Achievements
              </CardTitle>
              <p className="text-muted-foreground">Celebrating your integrated wellness milestones</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {badges.slice(-6).map((badge, index) => (
                  <Badge 
                    key={badge.id} 
                    variant="secondary" 
                    className="p-3 sm:p-4 text-sm sm:text-base rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200/50 dark:border-yellow-800/50 hover:scale-105 transition-transform duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img 
                      src="/assets/generated/achievement-badge.png" 
                      alt="Badge" 
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3"
                    />
                    {badge.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <FloatingAgent />
    </div>
  );
};

export default Dashboard;
