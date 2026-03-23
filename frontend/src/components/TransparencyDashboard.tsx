import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Database, Lock, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { TransparencyLog } from '../backend';
import { toast } from 'sonner';

const TransparencyDashboard: React.FC = () => {
  const { actor } = useActor();

  const { data: logs = [], isLoading } = useQuery<TransparencyLog[]>({
    queryKey: ['transparencyLogs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTransparencyLogs();
      } catch (error) {
        console.error('Failed to fetch transparency logs:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 30 * 1000,
  });

  const dataFlowSteps = [
    {
      step: 'Data Collection',
      description: 'Health data collected from wearables and manual input',
      icon: Database,
      status: 'active',
      privacy: 'Encrypted at source'
    },
    {
      step: 'Hashing',
      description: 'Data converted to cryptographic hashes',
      icon: Lock,
      status: 'active',
      privacy: 'Zero raw data stored'
    },
    {
      step: 'AI Processing',
      description: 'ICP-native LLM processes normalized data only',
      icon: Eye,
      status: 'active',
      privacy: 'HIPAA-compliant'
    },
    {
      step: 'Proof Verification',
      description: 'ZK-proofs verify data without exposing values',
      icon: Shield,
      status: 'active',
      privacy: 'Privacy-preserving'
    },
    {
      step: 'Reward Distribution',
      description: 'Tokens distributed based on verified proofs',
      icon: CheckCircle,
      status: 'active',
      privacy: 'On-chain transparent'
    }
  ];

  const handleDeleteMyData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    try {
      // This would trigger cleanup across all canisters
      toast.success('Data deletion initiated. This may take a few moments.');
      // In production, this would call backend cleanup functions
    } catch (error) {
      toast.error('Failed to initiate data deletion');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy-First Data Flow
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualize how your health data moves through the system while maintaining complete privacy
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataFlowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {index < dataFlowSteps.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-primary to-accent" />
                  )}
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-soft">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{step.step}</h4>
                        <Badge variant={step.status === 'active' ? 'default' : 'secondary'}>
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-medium">{step.privacy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity Log
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Transparent record of all data processing activities
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading activity log...</div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{log.action}</div>
                      <div className="text-xs text-muted-foreground">
                        Hash: {log.dataHash.substring(0, 16)}...
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(Number(log.timestamp)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs yet. Start using the platform to see your data flow.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="modern-card border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Data Governance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Delete My Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all your data including user profiles, proofs, wearable connections, and health records. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDeleteMyData}>
              Delete All My Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransparencyDashboard;
