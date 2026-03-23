import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Trash2, Save, Upload, Share2 } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HealthProtocol } from '../backend';
import { toast } from 'sonner';

const ProtocolBuilder: React.FC = () => {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [protocolName, setProtocolName] = useState('');
  const [timeframe, setTimeframe] = useState('30');
  const [goals, setGoals] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [newAction, setNewAction] = useState('');

  const { data: protocols = [] } = useQuery<HealthProtocol[]>({
    queryKey: ['healthProtocols'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserHealthProtocols();
    },
    enabled: !!actor,
  });

  const createProtocol = useMutation({
    mutationFn: async (protocol: HealthProtocol) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createHealthProtocol(protocol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthProtocols'] });
      toast.success('Protocol created successfully');
      resetForm();
      setIsCreating(false);
    },
  });

  const resetForm = () => {
    setProtocolName('');
    setTimeframe('30');
    setGoals([]);
    setActions([]);
    setNewGoal('');
    setNewAction('');
  };

  const handleCreateProtocol = async () => {
    if (!protocolName.trim() || goals.length === 0 || actions.length === 0 || !identity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const protocol: HealthProtocol = {
      id: `protocol-${Date.now()}`,
      userId: identity.getPrincipal(),
      name: protocolName,
      goals,
      timeframe: BigInt(parseInt(timeframe)),
      metrics: [],
      actions,
      createdBy: identity.getPrincipal(),
      createdAt: BigInt(Date.now()),
      version: BigInt(1),
      status: 'active'
    };

    await createProtocol.mutateAsync(protocol);
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Health Protocol Builder
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Protocol
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Health Protocol</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Protocol Name</Label>
                  <Input
                    value={protocolName}
                    onChange={(e) => setProtocolName(e.target.value)}
                    placeholder="e.g., 30-Day Fitness Challenge"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeframe (days)</Label>
                  <Input
                    type="number"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Goals</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a goal..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newGoal.trim()) {
                          setGoals([...goals, newGoal.trim()]);
                          setNewGoal('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newGoal.trim()) {
                          setGoals([...goals, newGoal.trim()]);
                          setNewGoal('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {goals.map((goal, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/20"
                        onClick={() => setGoals(goals.filter((_, i) => i !== index))}
                      >
                        {goal} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      placeholder="Add an action..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newAction.trim()) {
                          setActions([...actions, newAction.trim()]);
                          setNewAction('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newAction.trim()) {
                          setActions([...actions, newAction.trim()]);
                          setNewAction('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {actions.map((action, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/20"
                        onClick={() => setActions(actions.filter((_, i) => i !== index))}
                      >
                        {action} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateProtocol}
                    disabled={createProtocol.isPending}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createProtocol.isPending ? 'Creating...' : 'Create Protocol'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Design structured health protocols with goals, timeframes, and actionable steps
        </p>
      </CardHeader>
      <CardContent>
        {protocols.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No protocols created yet</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Protocol
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {protocols.map((protocol) => (
              <div
                key={protocol.id}
                className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{protocol.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {Number(protocol.timeframe)} days • {protocol.goals.length} goals • {protocol.actions.length} actions
                    </p>
                  </div>
                  <Badge variant={protocol.status === 'active' ? 'default' : 'secondary'}>
                    {protocol.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Goals:</p>
                    <div className="flex flex-wrap gap-1">
                      {protocol.goals.slice(0, 3).map((goal, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                      {protocol.goals.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{protocol.goals.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Professional Collaboration</h4>
          <p className="text-sm text-muted-foreground">
            Share protocols with approved professionals who can provide guidance while maintaining your data privacy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolBuilder;
