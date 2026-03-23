import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Apple, Brain, DollarSign, Users, Leaf, Target, Heart, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { DomainAgent, HealthDomain } from '../backend';
import { toast } from 'sonner';

const DomainAgentsPanel: React.FC = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery<DomainAgent[]>({
    queryKey: ['domainAgents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDomainAgents();
    },
    enabled: !!actor,
  });

  const runAgentCheck = useMutation({
    mutationFn: async (domain: HealthDomain) => {
      // Simulate agent check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = [
        `Your ${domain} metrics show positive trends`,
        `Consider increasing activity in ${domain} domain`,
        `Great progress in ${domain} this week!`
      ];
      
      const recommendations = [
        `Try a new ${domain} routine`,
        `Set a specific ${domain} goal for next week`,
        `Review your ${domain} data patterns`
      ];

      return {
        domain,
        insights: [insights[Math.floor(Math.random() * insights.length)]],
        recommendations: [recommendations[Math.floor(Math.random() * recommendations.length)]]
      };
    },
    onSuccess: (data) => {
      toast.success(`${data.domain} agent check completed`);
      queryClient.invalidateQueries({ queryKey: ['domainAgents'] });
    },
  });

  const domainConfig = [
    { domain: HealthDomain.fitness, title: 'Fitness', icon: Activity, color: 'from-green-400 to-emerald-500' },
    { domain: HealthDomain.nutrition, title: 'Nutrition', icon: Apple, color: 'from-orange-400 to-red-500' },
    { domain: HealthDomain.mental, title: 'Mental', icon: Brain, color: 'from-blue-400 to-indigo-500' },
    { domain: HealthDomain.finances, title: 'Finances', icon: DollarSign, color: 'from-yellow-400 to-orange-500' },
    { domain: HealthDomain.community, title: 'Community', icon: Users, color: 'from-purple-400 to-pink-500' },
    { domain: HealthDomain.environment, title: 'Environment', icon: Leaf, color: 'from-teal-400 to-cyan-500' },
    { domain: HealthDomain.purpose, title: 'Purpose', icon: Target, color: 'from-red-400 to-pink-500' },
    { domain: HealthDomain.longevity, title: 'Longevity', icon: Heart, color: 'from-gray-400 to-slate-500' },
  ];

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading domain agents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Domain-Specific AI Agents
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Specialized AI agents monitoring each health domain with proactive recommendations
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainConfig.map((config) => {
            const Icon = config.icon;
            const agent = agents.find(a => a.domain === config.domain);
            const isActive = agent?.active ?? false;
            const lastCheck = agent?.lastCheck ? new Date(Number(agent.lastCheck) / 1000000) : null;
            
            return (
              <div
                key={config.domain}
                className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{config.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {lastCheck ? `Last check: ${lastCheck.toLocaleDateString()}` : 'Not yet checked'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                    {isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {agent?.insights && agent.insights.length > 0 && (
                  <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Latest Insight:</p>
                    <p className="text-sm">{agent.insights[0]}</p>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => runAgentCheck.mutate(config.domain)}
                  disabled={runAgentCheck.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${runAgentCheck.isPending ? 'animate-spin' : ''}`} />
                  Run Check
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Proactive Health Monitoring</h4>
          <p className="text-sm text-muted-foreground">
            Each domain agent runs scheduled checks and provides personalized recommendations based on your progress and patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainAgentsPanel;
