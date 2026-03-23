import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, MessageSquare, Target, Sparkles, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { AIMemoryProfile } from '../backend';

const AIMemoryProfileComponent: React.FC = () => {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  
  const [communicationStyle, setCommunicationStyle] = useState('balanced');
  const [goalPriorities, setGoalPriorities] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');

  const { data: memoryProfile, isLoading } = useQuery<AIMemoryProfile | null>({
    queryKey: ['aiMemoryProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAIMemoryProfile();
    },
    enabled: !!actor,
  });

  const saveProfile = useMutation({
    mutationFn: async (profile: AIMemoryProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveAIMemoryProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiMemoryProfile'] });
      toast.success('AI Memory Profile updated successfully');
    },
  });

  const handleSaveProfile = async () => {
    if (!actor || !identity) return;

    const profile: AIMemoryProfile = {
      userId: identity.getPrincipal(),
      healthStats: memoryProfile?.healthStats || [],
      preferences: [
        ['communicationStyle', communicationStyle],
        ...(memoryProfile?.preferences || []).filter(([key]) => key !== 'communicationStyle')
      ],
      toneVectors: memoryProfile?.toneVectors || [],
      communicationStyle,
      goalPriorities,
      interactionHistory: memoryProfile?.interactionHistory || [],
      lastUpdated: BigInt(Date.now())
    };

    await saveProfile.mutateAsync(profile);
  };

  const addGoalPriority = () => {
    if (newGoal.trim() && !goalPriorities.includes(newGoal.trim())) {
      setGoalPriorities([...goalPriorities, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoalPriority = (goal: string) => {
    setGoalPriorities(goalPriorities.filter(g => g !== goal));
  };

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading AI Memory Profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Memory Profile
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize how your AI companion learns and adapts to your preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferences">
              <MessageSquare className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="insights">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Communication Style</Label>
              <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise & Direct</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="detailed">Detailed & Explanatory</SelectItem>
                  <SelectItem value="motivational">Motivational & Encouraging</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How your AI companion communicates with you
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Interaction History
              </h4>
              <p className="text-sm text-muted-foreground">
                {memoryProfile?.interactionHistory?.length || 0} conversations recorded
              </p>
              <p className="text-xs text-muted-foreground">
                Your AI learns from each interaction to provide better recommendations
              </p>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Goal Priorities</Label>
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a health goal..."
                  onKeyPress={(e) => e.key === 'Enter' && addGoalPriority()}
                />
                <Button onClick={addGoalPriority} size="sm">
                  Add
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {goalPriorities.map((goal, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeGoalPriority(goal)}
                >
                  {goal} ×
                </Badge>
              ))}
              {goalPriorities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No goal priorities set. Add goals to help your AI focus on what matters most.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm text-muted-foreground mb-1">Health Stats Tracked</div>
                <div className="text-2xl font-bold">{memoryProfile?.healthStats?.length || 0}</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm text-muted-foreground mb-1">Preferences Learned</div>
                <div className="text-2xl font-bold">{memoryProfile?.preferences?.length || 0}</div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Context-Aware AI</h4>
              <p className="text-sm text-muted-foreground">
                Your AI companion remembers your goals, preferences, and interaction patterns to provide increasingly personalized recommendations over time.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSaveProfile} disabled={saveProfile.isPending} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saveProfile.isPending ? 'Saving...' : 'Save AI Memory Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIMemoryProfileComponent;
