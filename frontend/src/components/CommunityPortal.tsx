import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, ThumbsUp, MessageSquare, TrendingUp, Plus, Vote } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { CommunityProposal } from '../backend';
import { toast } from 'sonner';

const CommunityPortal: React.FC = () => {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });

  const { data: proposals = [] } = useQuery<CommunityProposal[]>({
    queryKey: ['communityProposals'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCommunityProposals();
      } catch (error) {
        console.error('Failed to fetch proposals:', error);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 30 * 1000,
  });

  const submitProposal = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitCommunityProposal(title, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityProposals'] });
      toast.success('Proposal submitted successfully!');
      setNewProposal({ title: '', description: '' });
      setShowCreateForm(false);
    },
    onError: () => {
      toast.error('Failed to submit proposal');
    },
  });

  const voteOnProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.voteOnProposal(proposalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityProposals'] });
      toast.success('Vote recorded!');
    },
    onError: () => {
      toast.error('Failed to vote on proposal');
    },
  });

  const handleSubmitProposal = () => {
    if (!newProposal.title || !newProposal.description) {
      toast.error('Please fill in all fields');
      return;
    }
    submitProposal.mutate(newProposal);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black gradient-text">Community Governance</h2>
          <p className="text-muted-foreground mt-2">
            Participate in shaping health protocols and platform features
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {showCreateForm && (
        <Card className="modern-card border-primary/50">
          <CardHeader>
            <CardTitle>Create New Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Proposal Title</label>
              <Input
                value={newProposal.title}
                onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Add Mediterranean Diet Protocol"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your proposal in detail..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitProposal} disabled={submitProposal.isPending}>
                {submitProposal.isPending ? 'Submitting...' : 'Submit Proposal'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.filter(p => p.status === 'pending').length}</div>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Total Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.reduce((sum, p) => sum + Number(p.votes), 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+45%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <Card key={proposal.id} className="modern-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{proposal.title}</h3>
                      <Badge variant="secondary" className={getStatusColor(proposal.status)}>
                        {proposal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{proposal.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Votes</span>
                      <span className="text-sm text-muted-foreground">{Number(proposal.votes)} votes</span>
                    </div>
                    <Progress value={Math.min(Number(proposal.votes) * 10, 100)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Proposed {new Date(Number(proposal.createdAt)).toLocaleDateString()}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => voteOnProposal.mutate(proposal.id)}
                      disabled={voteOnProposal.isPending || proposal.status !== 'pending'}
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      Vote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="modern-card">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to propose a new health protocol or platform feature!
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Proposal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityPortal;
