import React, { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useGetCallerUserProfile, useGetDomainProgress, useGetBadges, useGetAscendTokenBalance, useSubmitBrandSuggestion } from '../hooks/useQueries';
import { HealthDomain } from '../backend';
import Header from '../components/Header';
import AIPageHeader from '../components/AIPageHeader';
import ProofOfLifeSubmission from '../components/ProofOfLifeSubmission';
import ProofHistoryDashboard from '../components/ProofHistoryDashboard';
import AscendTokenRewards from '../components/AscendTokenRewards';
import HealthIndicatorsTable from '../components/HealthIndicatorsTable';
import CustomChartBuilder from '../components/CustomChartBuilder';
import EnhancedWearableHub from '../components/EnhancedWearableHub';
import HealthRecordsUpload from '../components/HealthRecordsUpload';
import DefiDashboard from './DefiDashboard';
import HealthShop from './HealthShop';
import OnboardingTour from '../components/OnboardingTour';
import QuickActionsMenu from '../components/QuickActionsMenu';
import ContextualHelp from '../components/ContextualHelp';
import { 
  Activity, 
  Apple, 
  Brain, 
  DollarSign, 
  Users, 
  Leaf, 
  Target, 
  Heart,
  BarChart3,
  CheckCircle,
  FlaskConical,
  Wallet,
  ShoppingCart,
  CalendarDays,
  Coins,
  Stethoscope,
  Send,
  ArrowUpDown,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
  Upload,
  Watch
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MainDashboard: React.FC = () => {
  const router = useRouter();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: domainProgress = [] } = useGetDomainProgress();
  const { data: badges = [] } = useGetBadges();
  const { data: tokenData } = useGetAscendTokenBalance();
  const submitBrandSuggestion = useSubmitBrandSuggestion();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [showAllIndicators, setShowAllIndicators] = useState(false);
  const [showWearables, setShowWearables] = useState(false);
  const [brandSuggestionForm, setBrandSuggestionForm] = useState({
    brandName: '',
    category: '',
    reason: '',
    userEmail: ''
  });

  const domains = [
    { 
      name: HealthDomain.fitness, 
      title: 'Fitness', 
      color: 'from-green-400 to-emerald-500',
      icon: Activity,
      priority: 'Next workout: HIIT at 6 PM',
      score: '85/100',
      blurb: 'Great progress on your cardio goals! 🏃‍♂️',
      wearableStatus: 'Oura Ring, WHOOP connected',
      details: {
        weeklyWorkouts: 5,
        avgHeartRate: 72,
        vo2Max: 48,
        activeMinutes: 180
      }
    },
    { 
      name: HealthDomain.nutrition, 
      title: 'Nutrition', 
      color: 'from-orange-400 to-red-500',
      icon: Apple,
      priority: 'Meal prep: High protein lunch',
      score: '78/100',
      blurb: 'Consider adding more leafy greens today 🥬',
      wearableStatus: 'Levels CGM synced',
      details: {
        avgProtein: 145,
        avgCalories: 2200,
        waterIntake: 2.5,
        mealQuality: 'Good'
      }
    },
    { 
      name: HealthDomain.mental, 
      title: 'Recovery & Mindfulness', 
      color: 'from-blue-400 to-indigo-500',
      icon: Brain,
      priority: 'Meditation: 10 min breathing',
      score: '92/100',
      blurb: 'Excellent sleep quality last night! 😴',
      wearableStatus: 'Apple Health, Oura Ring',
      details: {
        avgSleep: 7.5,
        sleepQuality: 92,
        meditationMinutes: 45,
        stressLevel: 'Low'
      }
    },
    { 
      name: HealthDomain.finances, 
      title: 'Finance', 
      color: 'from-yellow-400 to-orange-500',
      icon: DollarSign,
      priority: 'Review: Monthly budget check',
      score: '73/100',
      blurb: 'Portfolio up 2.3% this week 📈',
      wearableStatus: 'No devices',
      details: {
        savingsRate: 25,
        investmentReturn: 8.5,
        debtRatio: 15,
        emergencyFund: 'Adequate'
      }
    },
    { 
      name: HealthDomain.longevity, 
      title: 'Longevity', 
      color: 'from-gray-400 to-slate-500',
      icon: Heart,
      priority: 'Lab review: Vitamin D levels',
      score: '88/100',
      blurb: 'Biomarkers looking optimal! 🧬',
      wearableStatus: 'Function Health connected',
      details: {
        biologicalAge: 32,
        chronologicalAge: 35,
        telomereLength: 'Above average',
        inflammationMarkers: 'Low'
      }
    },
    { 
      name: HealthDomain.purpose, 
      title: 'Purpose & Productivity', 
      color: 'from-red-400 to-pink-500',
      icon: Target,
      priority: 'Goal setting: Q1 objectives',
      score: '81/100',
      blurb: 'Crushing your weekly targets! 🎯',
      wearableStatus: 'No devices',
      details: {
        goalsCompleted: 12,
        focusHours: 35,
        projectProgress: 78,
        learningTime: 8
      }
    },
    { 
      name: HealthDomain.environment, 
      title: 'Environment', 
      color: 'from-teal-400 to-cyan-500',
      icon: Leaf,
      priority: 'Air quality: Open windows',
      score: '76/100',
      blurb: 'Great job on sustainable choices 🌱',
      wearableStatus: 'No devices',
      details: {
        airQuality: 'Good',
        sustainabilityScore: 82,
        carbonFootprint: 'Below average',
        greenSpaceTime: 120
      }
    },
    { 
      name: HealthDomain.community, 
      title: 'Community', 
      color: 'from-purple-400 to-pink-500',
      icon: Users,
      priority: 'Social: Coffee with Sarah',
      score: '84/100',
      blurb: 'Strong social connections this week! 👥',
      wearableStatus: 'No devices',
      details: {
        socialInteractions: 15,
        qualityTime: 12,
        communityEvents: 3,
        supportNetwork: 'Strong'
      }
    },
  ];

  const calculateOverallScore = () => {
    if (domainProgress.length === 0) return 87;
    const totalScore = domainProgress.reduce((sum, [, progress]) => sum + Number(progress.score), 0);
    return Math.round(totalScore / domainProgress.length);
  };

  const navigate = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBrandSuggestion = async () => {
    if (!brandSuggestionForm.brandName || !brandSuggestionForm.category || !brandSuggestionForm.userEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitBrandSuggestion.mutateAsync({
        brandName: brandSuggestionForm.brandName,
        category: brandSuggestionForm.category,
        reason: brandSuggestionForm.reason || null,
        userEmail: brandSuggestionForm.userEmail
      });
      
      toast.success('Brand suggestion submitted successfully! We\'ll review it and get back to you.');
      setBrandSuggestionForm({ brandName: '', category: '', reason: '', userEmail: '' });
    } catch (error) {
      toast.error('Failed to submit brand suggestion. Please try again.');
    }
  };

  const toggleDomainExpansion = (domainName: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainName)) {
      newExpanded.delete(domainName);
    } else {
      newExpanded.add(domainName);
    }
    setExpandedDomains(newExpanded);
  };

  const overallScore = calculateOverallScore();

  const labData = [
    { category: 'Heart Health', tests: 8, optimal: 6, suboptimal: 2, critical: 0 },
    { category: 'Thyroid', tests: 4, optimal: 3, suboptimal: 1, critical: 0 },
    { category: 'Metabolic', tests: 6, optimal: 4, suboptimal: 2, critical: 0 },
    { category: 'Nutrients', tests: 12, optimal: 9, suboptimal: 3, critical: 0 },
    { category: 'Liver', tests: 5, optimal: 5, suboptimal: 0, critical: 0 },
    { category: 'Kidneys', tests: 4, optimal: 4, suboptimal: 0, critical: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
      
      {/* Quick Actions Menu */}
      <QuickActionsMenu />
      
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation Tabs */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1">
              <TabsTrigger value="dashboard" className="rounded-xl font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="health-labs" className="rounded-xl font-medium">
                <FlaskConical className="w-4 h-4 mr-2" />
                Health Labs
              </TabsTrigger>
              <TabsTrigger value="defi" className="rounded-xl font-medium">
                <Wallet className="w-4 h-4 mr-2" />
                DeFi Dashboard
              </TabsTrigger>
              <TabsTrigger value="shop" className="rounded-xl font-medium">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Health Shop
              </TabsTrigger>
              <TabsTrigger value="schedule" className="rounded-xl font-medium">
                <CalendarDays className="w-4 h-4 mr-2" />
                Weekly Schedule
              </TabsTrigger>
            </TabsList>
            
            <ContextualHelp page={activeTab as any} />
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* AI Chat and Insights at Top */}
            <AIPageHeader 
              pageContext="dashboard"
              insights={`Hello ${userProfile?.name}! Your integrated health score is ${overallScore}. You have 4 connected wearables syncing data. Your sleep quality improved 12% and your portfolio is up 2.3% this week. You've earned ${tokenData?.balance || 0} Ascend tokens from proof submissions. Keep up the excellent work!`}
            />

            {/* Essential Actions Above Fold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button size="lg" className="modern-button h-16">
                <Activity className="w-5 h-5 mr-2" />
                Sync Wearables
              </Button>
              <Button size="lg" variant="outline" className="h-16">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Health Score
              </Button>
              <Button size="lg" variant="outline" className="h-16">
                <Zap className="w-5 h-5 mr-2" />
                Ask AI
              </Button>
            </div>

            {/* Header Section */}
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
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-2xl font-bold text-primary">{overallScore}/100</div>
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">{tokenData?.balance || 0} Ascend</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof of Life Section - Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between mb-4">
                  <span className="font-semibold">Daily Health Tracking</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up mb-6" style={{ animationDelay: '0.05s' }}>
                  <ProofOfLifeSubmission />
                  <ProofHistoryDashboard />
                  <AscendTokenRewards />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Domain Grid with Progressive Disclosure */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {domains.map((domain, index) => {
                const Icon = domain.icon;
                const isExpanded = expandedDomains.has(domain.name);
                return (
                  <Card
                    key={domain.name}
                    className={`modern-card cursor-pointer transition-all duration-300 bg-gradient-to-br ${domain.color.replace('to-', 'to-').replace('from-', 'from-').replace('400', '50').replace('500', '100')} dark:from-opacity-20 dark:to-opacity-10 border-opacity-50`}
                  >
                    <CardHeader className="pb-3" onClick={() => navigate(`/domain/${domain.name}`)}>
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${domain.color} shadow-soft`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                          {domain.score}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold">{domain.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-primary">Top Priority:</div>
                        <div className="text-sm text-muted-foreground">{domain.priority}</div>
                      </div>
                      <div className="text-sm font-medium text-foreground">{domain.blurb}</div>
                      
                      {/* Progressive Disclosure */}
                      <Collapsible open={isExpanded} onOpenChange={() => toggleDomainExpansion(domain.name)}>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDomainExpansion(domain.name);
                            }}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Show Details
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3 space-y-2 border-t mt-3">
                          {Object.entries(domain.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                      
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        <strong>Wearables:</strong> {domain.wearableStatus}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Health Labs Tab */}
          <TabsContent value="health-labs" className="space-y-8">
            {/* AI Chat and Insights at Top */}
            <AIPageHeader pageContext="health-labs" />

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black gradient-text">Health Labs Dashboard</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive analysis of 100+ health indicators from wearables, lab results, and uploaded medical records with AI-powered insights
              </p>
            </div>

            {/* Consolidated Health Records Upload Portal - Single Prominent Interface */}
            <HealthRecordsUpload />

            {/* Collapsible Wearables Section */}
            <Collapsible open={showWearables} onOpenChange={setShowWearables}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-14 text-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Watch className="w-5 h-5" />
                    Wearables
                  </span>
                  {showWearables ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <EnhancedWearableHub />
              </CollapsibleContent>
            </Collapsible>
            
            {/* Progressive Disclosure for Health Indicators */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Health Indicators</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllIndicators(!showAllIndicators)}
                >
                  {showAllIndicators ? 'Show Essential Only' : 'Show All 100+ Indicators'}
                </Button>
              </div>
              {showAllIndicators && <HealthIndicatorsTable />}
            </div>
            
            <CustomChartBuilder />

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="font-semibold">Lab Categories Overview</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        Lab Categories Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={labData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="category" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Bar dataKey="optimal" fill="oklch(var(--primary))" name="Optimal" />
                            <Bar dataKey="suboptimal" fill="oklch(var(--accent))" name="Suboptimal" />
                            <Bar dataKey="critical" fill="oklch(var(--destructive))" name="Critical" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FlaskConical className="w-5 h-5" />
                        Key Biomarkers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Total Cholesterol', value: 185, unit: 'mg/dL', benchmark: '<200', status: 'optimal' },
                        { name: 'Fasting Glucose', value: 92, unit: 'mg/dL', benchmark: '<100', status: 'optimal' },
                        { name: 'Vitamin D', value: 32, unit: 'ng/mL', benchmark: '>30', status: 'optimal' },
                        { name: 'TSH', value: 2.8, unit: 'mIU/L', benchmark: '0.4-4.0', status: 'optimal' },
                        { name: 'HbA1c', value: 5.4, unit: '%', benchmark: '<5.7', status: 'optimal' },
                      ].map((biomarker) => (
                        <div key={biomarker.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <div>
                            <div className="font-medium">{biomarker.name}</div>
                            <div className="text-sm text-muted-foreground">Benchmark: {biomarker.benchmark}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{biomarker.value} {biomarker.unit}</div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600 capitalize">{biomarker.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* DeFi Dashboard Tab - Now using dedicated component */}
          <TabsContent value="defi" className="space-y-8">
            <DefiDashboard />
          </TabsContent>

          {/* Health Shop Tab - Now using dedicated component */}
          <TabsContent value="shop" className="space-y-8">
            {/* AI Chat and Insights at Top */}
            <AIPageHeader pageContext="shop" />

            {/* Essential Shop Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button size="lg" className="modern-button h-16">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Products
              </Button>
              <Button size="lg" variant="outline" className="h-16">
                <ShoppingCart className="w-5 h-5 mr-2" />
                View Cart
              </Button>
              <Button size="lg" variant="outline" className="h-16">
                <Coins className="w-5 h-5 mr-2" />
                Check Rewards Balance
              </Button>
            </div>

            <HealthShop />

            {/* Brand Suggestion Form - Collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="font-semibold">Suggest a Brand</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="modern-card mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Suggest a Brand
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="brandName">Brand Name *</Label>
                          <Input
                            id="brandName"
                            value={brandSuggestionForm.brandName}
                            onChange={(e) => setBrandSuggestionForm(prev => ({ ...prev, brandName: e.target.value }))}
                            placeholder="Enter brand name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select 
                            value={brandSuggestionForm.category}
                            onValueChange={(value) => setBrandSuggestionForm(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supplements">Supplements</SelectItem>
                              <SelectItem value="peptides">Peptides</SelectItem>
                              <SelectItem value="devices">Devices</SelectItem>
                              <SelectItem value="testing">Testing Kits</SelectItem>
                              <SelectItem value="programs">Programs</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="userEmail">Your Email *</Label>
                          <Input
                            id="userEmail"
                            type="email"
                            value={brandSuggestionForm.userEmail}
                            onChange={(e) => setBrandSuggestionForm(prev => ({ ...prev, userEmail: e.target.value }))}
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reason">Reason (Optional)</Label>
                          <Textarea
                            id="reason"
                            value={brandSuggestionForm.reason}
                            onChange={(e) => setBrandSuggestionForm(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Why should we add this brand? What makes it special?"
                            rows={4}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleBrandSuggestion}
                          disabled={submitBrandSuggestion.isPending}
                          className="w-full"
                        >
                          {submitBrandSuggestion.isPending ? (
                            <>
                              <ArrowUpDown className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Suggestion
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* Weekly Schedule Tab */}
          <TabsContent value="schedule" className="space-y-8">
            {/* AI Chat and Insights at Top */}
            <AIPageHeader pageContext="schedule" />

            {/* Essential Schedule Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button size="lg" className="modern-button h-16">
                <CalendarDays className="w-5 h-5 mr-2" />
                Add Event
              </Button>
              <Button size="lg" variant="outline" className="h-16">
                <Activity className="w-5 h-5 mr-2" />
                Sync Calendar
              </Button>
              <Button size="lg" variant="outline" className="h-16">
                <Zap className="w-5 h-5 mr-2" />
                Optimize Schedule
              </Button>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black gradient-text">Weekly Schedule</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                7-day calendar view with auto-populated health routines and calendar sync
              </p>
            </div>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { service: 'Google Calendar', connected: true, lastSync: '2 min ago' },
                    { service: 'Apple Calendar', connected: false, lastSync: 'Not connected' },
                    { service: 'Outlook Calendar', connected: false, lastSync: 'Not connected' },
                  ].map((calendar, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{calendar.service}</div>
                        <Badge variant={calendar.connected ? "default" : "secondary"}>
                          {calendar.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{calendar.lastSync}</div>
                      {!calendar.connected && (
                        <Button size="sm" className="mt-2 w-full">Connect</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  This Week's Health Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="space-y-2">
                      <div className="font-semibold text-sm">{day}</div>
                      <div className="space-y-1">
                        {index === 0 && (
                          <>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs">HIIT Workout</div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">Meditation</div>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">Submit Proof</div>
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-xs">Meal Prep</div>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">Submit Proof</div>
                          </>
                        )}
                        {index === 4 && (
                          <>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">Lab Review</div>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">Submit Proof</div>
                          </>
                        )}
                        {index === 6 && (
                          <>
                            <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded text-xs">Weekly Planning</div>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">Submit Proof</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MainDashboard;
