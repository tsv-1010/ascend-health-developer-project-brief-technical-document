import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, CheckCircle, AlertCircle, Shield, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BlackboardWriteLockInterface: React.FC = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Query to check current lock status
  const { data: isLocked, isLoading: isCheckingLock } = useQuery<boolean>({
    queryKey: ['blackboardLockStatus'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isBlackboardLocked();
      } catch (error) {
        console.error('Failed to check blackboard lock status:', error);
        return false;
      }
    },
    enabled: !!actor,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Mutation to acquire write lock
  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      setOperationInProgress(true);
      return await actor.lockBlackboard();
    },
    onSuccess: (message) => {
      if (message.includes('Unauthorized')) {
        toast.error(message);
      } else if (message.includes('already active')) {
        toast.warning(message);
      } else {
        toast.success(message);
      }
      queryClient.invalidateQueries({ queryKey: ['blackboardLockStatus'] });
      setOperationInProgress(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to acquire lock: ${error.message}`);
      setOperationInProgress(false);
    },
  });

  // Mutation to release write lock
  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      setOperationInProgress(true);
      return await actor.unlockBlackboard();
    },
    onSuccess: (message) => {
      if (message.includes('Unauthorized')) {
        toast.error(message);
      } else if (message.includes('not active')) {
        toast.info(message);
      } else {
        toast.success(message);
      }
      queryClient.invalidateQueries({ queryKey: ['blackboardLockStatus'] });
      setOperationInProgress(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to release lock: ${error.message}`);
      setOperationInProgress(false);
    },
  });

  const handleLock = () => {
    lockMutation.mutate();
  };

  const handleUnlock = () => {
    unlockMutation.mutate();
  };

  return (
    <Card className="modern-card border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Blackboard Write-Lock Mechanism
              <Badge variant="default" className="ml-2 bg-indigo-600">
                Sprint 2 Phase A Step 2
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Simple boolean flag preventing concurrent agent writes with safe, non-blocking operations
            </p>
          </div>
          <div className="text-right">
            {isCheckingLock ? (
              <Badge variant="outline">Checking...</Badge>
            ) : (
              <Badge variant={isLocked ? 'destructive' : 'default'} className="text-lg px-4 py-2">
                {isLocked ? (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Locked
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Unlock className="w-4 h-4" />
                    Unlocked
                  </span>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        <Alert className={isLocked ? 'border-red-500/30 bg-red-500/10' : 'border-green-500/30 bg-green-500/10'}>
          <div className="flex items-start gap-3">
            {isLocked ? (
              <Lock className="w-5 h-5 text-red-600 mt-0.5" />
            ) : (
              <Unlock className="w-5 h-5 text-green-600 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription>
                {isLocked ? (
                  <div>
                    <div className="font-semibold text-red-600 mb-1">Write Lock Active</div>
                    <div className="text-sm text-muted-foreground">
                      The blackboard is currently locked to prevent concurrent agent writes. Release the lock after safe writes complete.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-green-600 mb-1">Write Lock Available</div>
                    <div className="text-sm text-muted-foreground">
                      The blackboard is unlocked and ready for agent write operations. Acquire the lock before writing.
                    </div>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Implementation Details */}
        <div className="space-y-3">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Info className="w-4 h-4" />
            Implementation Features
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Boolean Flag Control</div>
                <div className="text-xs text-muted-foreground">
                  Simple isWriteLocked flag initialized to false, preventing concurrent writes
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Access Control Guards</div>
                <div className="text-xs text-muted-foreground">
                  User/admin permissions required - returns readable status strings
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">No Debug.trap Usage</div>
                <div className="text-xs text-muted-foreground">
                  Returns confirmation text or error messages without causing traps
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Automatic Reset</div>
                <div className="text-xs text-muted-foreground">
                  Flag resets on blackboard clear or session reset automatically
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleLock}
            disabled={isLocked || operationInProgress || lockMutation.isPending}
            className="flex-1"
            variant={isLocked ? 'outline' : 'default'}
          >
            <Lock className="w-4 h-4 mr-2" />
            {lockMutation.isPending ? 'Acquiring Lock...' : 'Acquire Write Lock'}
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={!isLocked || operationInProgress || unlockMutation.isPending}
            className="flex-1"
            variant={isLocked ? 'default' : 'outline'}
          >
            <Unlock className="w-4 h-4 mr-2" />
            {unlockMutation.isPending ? 'Releasing Lock...' : 'Release Write Lock'}
          </Button>
        </div>

        {/* Technical Details */}
        <div className="p-4 bg-muted/30 rounded-lg border border-indigo-500/20">
          <div className="text-xs font-semibold mb-2 text-indigo-600">Technical Implementation</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5" />
              <div>
                <span className="font-medium">lockBlackboard():</span> Sets flag to true if not already locked, returns confirmation or error message
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5" />
              <div>
                <span className="font-medium">unlockBlackboard():</span> Resets flag to false after safe writes complete, returns status message
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5" />
              <div>
                <span className="font-medium">isBlackboardLocked():</span> Query function to check current lock status for authenticated users
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5" />
              <div>
                <span className="font-medium">Goal:</span> Establish safe foundation for serialized Blackboard writes without startup dependencies or authorization traps
              </div>
            </div>
          </div>
        </div>

        {/* Future Enhancements Note */}
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-xs">
            <span className="font-semibold text-blue-600">Future Steps:</span> This write-lock mechanism provides the foundation for upcoming Blackboard write and retrieval functions (Step A.2.4+) that will enable agents to share insights across domains with proper authorization and serialized access control.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BlackboardWriteLockInterface;
