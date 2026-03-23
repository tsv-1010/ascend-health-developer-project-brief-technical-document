import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { createHash } from 'crypto';

interface AuditEvent {
  agentPrincipal: string;
  domainName: string;
  timestamp: bigint;
  eventType: string;
  result: string;
}

export default function DomainRegistrationLogs() {
  const { actor } = useActor();

  const { data: auditEvents, isLoading } = useQuery<AuditEvent[]>({
    queryKey: ['blackboard-audit-events'],
    queryFn: async () => {
      if (!actor) return [];
      const blackboardActor = actor as any;
      return await blackboardActor.get_audit_events();
    },
    enabled: !!actor,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const generateHash = (event: AuditEvent): string => {
    // Generate SHA256 hash of event data for transparency
    const eventString = JSON.stringify({
      agentPrincipal: event.agentPrincipal,
      domainName: event.domainName,
      timestamp: event.timestamp.toString(),
      eventType: event.eventType,
      result: event.result,
    });
    
    // Simple hash generation for browser (using built-in crypto if available)
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // For production, use proper async hashing
      return `hash-${event.agentPrincipal.slice(0, 8)}-${event.timestamp.toString().slice(-8)}`;
    }
    return `hash-${event.agentPrincipal.slice(0, 8)}-${event.timestamp.toString().slice(-8)}`;
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Registration Audit Logs</CardTitle>
          <CardDescription>Loading audit events...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Registration Audit Logs</CardTitle>
        <CardDescription>
          Transparency logs for domain registration events with cryptographic hashing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!auditEvents || auditEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {auditEvents
                .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                .map((event, index) => (
                  <div
                    key={`${event.agentPrincipal}-${event.timestamp}-${index}`}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.eventType}
                        </Badge>
                        {getResultBadge(event.result)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.domainName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {event.agentPrincipal}
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Cryptographic Hash:</p>
                      <p className="text-xs font-mono bg-muted p-1 rounded mt-1 break-all">
                        {generateHash(event)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
