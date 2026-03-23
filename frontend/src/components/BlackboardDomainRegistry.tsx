import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DomainRegistryEntry {
  agentPrincipal: string;
  domainName: string;
  registeredAt: bigint;
  verified: boolean;
  lastPingTime: bigint | null;
  lastPongTime: bigint | null;
}

export default function BlackboardDomainRegistry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: domains, isLoading } = useQuery<DomainRegistryEntry[]>({
    queryKey: ['blackboard-domains'],
    queryFn: async () => {
      if (!actor) return [];
      const blackboardActor = actor as any; // Blackboard canister actor
      return await blackboardActor.list_registered_domains();
    },
    enabled: !!actor,
  });

  const pingAllMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const blackboardActor = actor as any;
      await blackboardActor.pingAll();
    },
    onSuccess: () => {
      toast.success('Ping sent to all domain agents');
      queryClient.invalidateQueries({ queryKey: ['blackboard-domains'] });
      queryClient.invalidateQueries({ queryKey: ['blackboard-audit-events'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to ping agents: ${error.message}`);
    },
  });

  const resetVerificationsMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const blackboardActor = actor as any;
      await blackboardActor.reset_all_verifications();
    },
    onSuccess: () => {
      toast.success('All verifications reset');
      queryClient.invalidateQueries({ queryKey: ['blackboard-domains'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset verifications: ${error.message}`);
    },
  });

  const getStatusBadge = (entry: DomainRegistryEntry) => {
    if (entry.verified) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    } else if (entry.lastPingTime) {
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <XCircle className="w-3 h-3 mr-1" />
          Unverified
        </Badge>
      );
    }
  };

  const formatTimestamp = (timestamp: bigint | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const calculateResponseTime = (entry: DomainRegistryEntry) => {
    if (!entry.lastPingTime || !entry.lastPongTime) return 'N/A';
    const responseTimeMs = (Number(entry.lastPongTime) - Number(entry.lastPingTime)) / 1_000_000;
    return `${responseTimeMs.toFixed(0)}ms`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Agent Registry</CardTitle>
          <CardDescription>Loading domain agents...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Agent Registry</CardTitle>
        <CardDescription>
          Heartbeat verification status for all registered domain agents
        </CardDescription>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => pingAllMutation.mutate()}
            disabled={pingAllMutation.isPending}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${pingAllMutation.isPending ? 'animate-spin' : ''}`} />
            Ping All Agents
          </Button>
          <Button
            onClick={() => resetVerificationsMutation.mutate()}
            disabled={resetVerificationsMutation.isPending}
            variant="outline"
            size="sm"
          >
            Reset Verifications
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!domains || domains.length === 0 ? (
          <p className="text-sm text-muted-foreground">No domain agents registered yet.</p>
        ) : (
          <div className="space-y-4">
            {domains.map((entry) => (
              <div
                key={entry.agentPrincipal}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{entry.domainName}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {entry.agentPrincipal}
                    </p>
                  </div>
                  {getStatusBadge(entry)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Registered:</span>
                    <p className="font-medium">{formatTimestamp(entry.registeredAt)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Response Time:</span>
                    <p className="font-medium">{calculateResponseTime(entry)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Ping:</span>
                    <p className="font-medium">{formatTimestamp(entry.lastPingTime)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Pong:</span>
                    <p className="font-medium">{formatTimestamp(entry.lastPongTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
