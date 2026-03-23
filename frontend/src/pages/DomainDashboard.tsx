import React, { useState } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetDomainProgress, useUpdateDomainProgress, useAddBadge } from '../hooks/useQueries';
import { HealthDomain, DomainProgress } from '../backend';
import Header from '../components/Header';
import { ArrowLeft, Play, TrendingUp, Award, Calendar, Target } from 'lucide-react';
import { toast } from 'sonner';

const DomainDashboard: React.FC = () => {
  const { domainId } = useParams({ from: '/domain/$domainId' });
  const router = useRouter();
  const { data: domainProgress = [] } = useGetDomainProgress();
  const updateProgress = useUpdateDomainProgress();
  const addBadge = useAddBadge();
  const [isPlaying, setIsPlaying] = useState(false);

  const domain = domainId as HealthDomain;
  const currentProgress = domainProgress.find(([d]) => d === domain)?.[1] || {
    score: BigInt(0),
    streak: BigInt(0),
    lastUpdated: BigInt(Date.now())
  };

  const domainInfo = {
    [HealthDomain.fitness]: {
      title: 'Fitness & Exercise',
      description: 'Build strength, endurance, and maintain an active lifestyle',
      image: '/assets/generated/fitness-sphere.png',
      color: 'from-green-400 to-blue-500',
      tips: [
        'Start with 30 minutes of moderate exercise daily',
        'Include both cardio and strength training',
        'Stay consistent with your workout routine',
        'Listen to your body and rest when needed'
      ],
      programs: [
        { name: 'Beginner Strength', duration: '4 weeks', difficulty: 'Easy' },
        { name: 'Cardio Blast', duration: '6 weeks', difficulty: 'Medium' },
        { name: 'HIIT Challenge', duration: '8 weeks', difficulty: 'Hard' }
      ]
    },
    [HealthDomain.nutrition]: {
      title: 'Nutrition & Diet',
      description: 'Fuel your body with balanced, nutritious meals',
      image: '/assets/generated/nutrition-sphere.png',
      color: 'from-orange-400 to-red-500',
      tips: [
        'Eat a variety of colorful fruits and vegetables',
        'Stay hydrated with 8 glasses of water daily',
        'Choose whole grains over processed foods',
        'Practice mindful eating habits'
      ],
      programs: [
        { name: 'Mediterranean Diet', duration: '30 days', difficulty: 'Easy' },
        { name: 'Plant-Based Transition', duration: '21 days', difficulty: 'Medium' },
        { name: 'Intermittent Fasting', duration: '12 weeks', difficulty: 'Hard' }
      ]
    },
    [HealthDomain.mental]: {
      title: 'Mental Health & Wellbeing',
      description: 'Nurture your mind and emotional wellness',
      image: '/assets/generated/mental-sphere.png',
      color: 'from-purple-400 to-pink-500',
      tips: [
        'Practice daily meditation or mindfulness',
        'Maintain healthy sleep patterns',
        'Connect with supportive friends and family',
        'Engage in activities that bring you joy'
      ],
      programs: [
        { name: 'Mindfulness Basics', duration: '2 weeks', difficulty: 'Easy' },
        { name: 'Stress Management', duration: '4 weeks', difficulty: 'Medium' },
        { name: 'Cognitive Behavioral Techniques', duration: '8 weeks', difficulty: 'Hard' }
      ]
    },
    [HealthDomain.finances]: {
      title: 'Financial Wellness',
      description: 'Build financial security and reduce money-related stress',
      image: '/assets/generated/finance-sphere.png',
      color: 'from-yellow-400 to-orange-500',
      tips: [
        'Create and stick to a monthly budget',
        'Build an emergency fund gradually',
        'Track your expenses regularly',
        'Invest in your financial education'
      ],
      programs: [
        { name: 'Budget Basics', duration: '2 weeks', difficulty: 'Easy' },
        { name: 'Debt Reduction Plan', duration: '12 weeks', difficulty: 'Medium' },
        { name: 'Investment Strategy', duration: '16 weeks', difficulty: 'Hard' }
      ]
    },
    [HealthDomain.community]: {
      title: 'Community & Relationships',
      description: 'Build meaningful connections and social support',
      image: '/assets/generated/community-sphere.png',
      color: 'from-blue-400 to-indigo-500',
      tips: [
        'Reach out to friends and family regularly',
        'Join groups with shared interests',
        'Volunteer for causes you care about',
        'Practice active listening in conversations'
      ],
      programs: [
        { name: 'Social Skills Building', duration: '3 weeks', difficulty: 'Easy' },
        { name: 'Community Engagement', duration: '6 weeks', difficulty: 'Medium' },
        { name: 'Leadership Development', duration: '10 weeks', difficulty: 'Hard' }
      ]
    },
    [HealthDomain.environment]: {
      title: 'Environmental Health',
      description: 'Create a healthy living environment and sustainable habits',
      image: '/assets/generated/environment-sphere.png',
      color: 'from-green-400 to-teal-500',
      tips: [
        'Reduce plastic use and waste',
        'Choose eco-friendly products',
        'Improve indoor air quality',
        'Spend time in nature regularly'
      ],
      programs: [
        { name: 'Green Living Basics', duration: '3 weeks', difficulty: 'Easy' },
        { name: 'Sustainable Lifestyle', duration: '8 weeks', difficulty: 'Medium' },
        { name: 'Zero Waste Challenge', duration: '12 weeks', difficulty: 'Hard' }
      ]
    },
    [HealthDomain.purpose]: {
      title: 'Purpose & Meaning',
      description: 'Discover your life purpose and align your actions with your values',
      image: '/assets/generated/purpose-sphere.png',
      color: 'from-indigo-400 to-purple-500',
      tips: [
        'Reflect on your core values regularly',
        'Set meaningful long-term goals',
        'Engage in activities that align with your purpose',
        'Help others and contribute to something bigger'
      ],
      programs: [
        { name: 'Values Discovery', duration: '2 weeks', difficulty: 'Easy' },
        { name: 'Goal Setting Mastery', duration: '4 weeks', difficulty: 'Medium' },
        { name: 'Life Purpose Workshop', duration: '8 weeks', difficulty: 'Hard' }
      ]
    },
    [HealthDomain.longevity]: {
      title: 'Longevity & Aging',
      description: 'Optimize your health for a long, vibrant life',
      image: '/assets/generated/longevity-sphere.png',
      color: 'from-teal-400 to-cyan-500',
      tips: [
        'Maintain regular health screenings',
        'Focus on preventive care',
        'Stay mentally and physically active',
        'Build strong social connections'
      ],
      programs: [
        { name: 'Healthy Aging Basics', duration: '4 weeks', difficulty: 'Easy' },
        { name: 'Longevity Lifestyle', duration: '8 weeks', difficulty: 'Medium' },
        { name: 'Advanced Biohacking', duration: '12 weeks', difficulty: 'Hard' }
      ]
    }
  };

  const info = domainInfo[domain];
  if (!info) {
    return <div>Domain not found</div>;
  }

  const playVoiceOverview = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(
        `Welcome to your ${info.title} dashboard. ${info.description}. Your current score is ${Number(currentProgress.score)} and you have a ${Number(currentProgress.streak)} day streak. Here are some tips to improve: ${info.tips.join('. ')}`
      );
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleProgressUpdate = async () => {
    const newScore = Math.min(100, Number(currentProgress.score) + Math.floor(Math.random() * 10) + 5);
    const newStreak = Number(currentProgress.streak) + 1;
    
    const updatedProgress: DomainProgress = {
      score: BigInt(newScore),
      streak: BigInt(newStreak),
      lastUpdated: BigInt(Date.now())
    };

    try {
      await updateProgress.mutateAsync({ domain, progress: updatedProgress });
      
      // Award badge for milestones
      if (newStreak === 7) {
        await addBadge.mutateAsync({
          id: `${domain}-week-streak`,
          name: `${info.title} Week Warrior`,
          description: `Maintained a 7-day streak in ${info.title}`,
          dateEarned: BigInt(Date.now())
        });
        toast.success('🏆 Badge earned: Week Warrior!');
      } else if (newScore >= 50 && Number(currentProgress.score) < 50) {
        await addBadge.mutateAsync({
          id: `${domain}-halfway`,
          name: `${info.title} Halfway Hero`,
          description: `Reached 50% progress in ${info.title}`,
          dateEarned: BigInt(Date.now())
        });
        toast.success('🏆 Badge earned: Halfway Hero!');
      }
      
      toast.success('Progress updated successfully!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const navigate = (path: string) => {
    router.navigate({ to: path });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-6 mb-6">
            <img 
              src={info.image} 
              alt={info.title}
              className="w-20 h-20 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">{info.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{info.description}</p>
              <Button onClick={playVoiceOverview} disabled={isPlaying} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                {isPlaying ? 'Playing Overview...' : 'Play Voice Overview'}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{Number(currentProgress.score)}</div>
              <Progress value={Number(currentProgress.score)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{Number(currentProgress.streak)}</div>
              <p className="text-xs text-muted-foreground">consecutive days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleProgressUpdate}
                disabled={updateProgress.isPending}
                className="w-full"
              >
                {updateProgress.isPending ? 'Updating...' : 'Log Progress'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Daily Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {info.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Programs</CardTitle>
                <p className="text-muted-foreground">
                  Structured programs to help you achieve your {info.title.toLowerCase()} goals
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {info.programs.map((program, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">{program.duration}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          program.difficulty === 'Easy' ? 'secondary' :
                          program.difficulty === 'Medium' ? 'default' : 'destructive'
                        }>
                          {program.difficulty}
                        </Badge>
                        <Button size="sm">Start Program</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Great Progress! 🎉
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You're maintaining a consistent streak in {info.title.toLowerCase()}. 
                      Keep up the excellent work!
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Recommendation 💡
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Based on your progress, consider trying the intermediate program 
                      to challenge yourself further.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Weekly Goal 🎯
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Aim to increase your score by 10 points this week through 
                      consistent daily activities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DomainDashboard;
