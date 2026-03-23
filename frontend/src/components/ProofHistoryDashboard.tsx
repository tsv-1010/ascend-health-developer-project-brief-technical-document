import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProofHistory, useVerifyProof } from '../hooks/useQueries';
import { CheckCircle, XCircle, Clock, Shield, Hash, Coins } from 'lucide-react';
import { toast } from 'sonner';

const ProofHistoryDashboard: React.FC = () => {
  const { data: proofHistory = [], isLoading } = useGetProofHistory();
  const verifyProof = useVerifyProof();

  const handleVerifyProof = async (healthDataHash: string) => {
    try {
      const result = await verifyProof.mutateAsync({ healthDataHash });
      if (result.verified) {
        toast.success('Proof verified successfully!');
      } else {
        toast.error('Proof verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify proof');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp)).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="/assets/generated/proof-history-dashboard.png" 
              alt="Proof History"
              className="w-6 h-6"
            />
            Proof History Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/assets/generated/proof-history-dashboard.png" 
            alt="Proof History"
            className="w-6 h-6"
          />
          Proof History Dashboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View your proof submission history with pass/fail status and token rewards
        </p>
      </CardHeader>
      <CardContent>
        {proofHistory.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No proofs submitted yet</h3>
            <p className="text-muted-foreground">
              Submit your first daily health data proof to start earning Ascend tokens!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proofHistory.map((proof, index) => (
              <div key={index} className="p-4 border rounded-xl bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatTimestamp(proof.timestamp)}
                    </span>
                  </div>
                  <Badge 
                    variant={proof.verified ? "default" : "secondary"}
                    className={proof.verified ? "bg-green-600" : "bg-red-600"}
                  >
                    {proof.verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </>
                    )}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Hash:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {formatHash(proof.healthDataHash)}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="text-muted-foreground">Reward:</span>
                      <span className={`font-medium ${proof.reward > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {proof.reward} Ascend Tokens
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyProof(proof.healthDataHash)}
                      disabled={verifyProof.isPending}
                      className="text-xs"
                    >
                      {verifyProof.isPending ? (
                        <>
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <img 
                      src="/assets/generated/privacy-hash-protection.png" 
                      alt="Privacy"
                      className="w-3 h-3"
                    />
                    Only cryptographic hash stored - raw health data never saved
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProofHistoryDashboard;
