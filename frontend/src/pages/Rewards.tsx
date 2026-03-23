import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetRewards, useGetBadges, useAddReward, useGetAscendTokenBalance, useGetProofHistory } from '../hooks/useQueries';
import Header from '../components/Header';
import AscendTokenRewards from '../components/AscendTokenRewards';
import ProofHistoryDashboard from '../components/ProofHistoryDashboard';
import { ArrowLeft, Coins, Trophy, Gift, TrendingUp, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';

const Rewards: React.FC = () => {
  const router = useRouter();
  const { data: rewards = [] } = useGetRewards();
  const { data: badges = [] } = useGetBadges();
  const { data: tokenData } = useGetAscendTokenBalance();
  const { data: proofHistory = [] } = useGetProofHistory();
  const addReward = useAddReward();

  // Mock data for demonstration
  const mockTokenBalance = tokenData?.balance || 1250;
  const mockYieldRate = 5.2;
  const mockStakedAmount = 800;

  const milestones = [
    { id: 1, title: 'First Week Streak', description: 'Complete 7 consecutive days', reward: 50, completed: true },
    { id: 2, title: 'Domain Master', description: 'Reach 80% in any domain', reward: 100, completed: false },
    { id: 3, title: 'Community Helper', description: 'Help 5 community members', reward: 75, completed: false },
    { id: 4, title: 'Wellness Warrior', description: 'Maintain 30-day streak', reward: 200, completed: false },
    { id: 5, title: 'Proof Pioneer', description: 'Submit 10 verified proofs', reward: 150, completed: proofHistory.filter(p => p.verified).length >= 10 },
    { id: 6, title: 'Health Data Master', description: 'Submit 30 verified proofs', reward: 300, completed: proofHistory.filter(p => p.verified).length >= 30 },
  ];

  const handleClaimReward = async (milestone: typeof milestones[0]) => {
    if (!milestone.completed) {
      toast.error('Milestone not yet completed');
      return;
    }

    try {
      await addReward.mutateAsync({
        id: `milestone-${milestone.id}`,
        type: 'milestone',
        amount: BigInt(milestone.reward),
        dateAwarded: BigInt(Date.now())
      });
      toast.success(`🎉 Claimed ${milestone.reward} tokens!`);
    } catch (error) {
      toast.error('Failed to claim reward');
    }
  };

  const handleStakeTokens = () => {
    toast.success('🔒 Staking feature coming soon!');
  };

  const handleUnstakeTokens = () => {
    toast.success('🔓 Unstaking feature coming soon!');
  };

  const navigate = (path: string) => {
    router.navigate({ to: path });
  };

  const verifiedProofs = proofHistory.filter(p => p.verified).length;
  const totalProofRewards = proofHistory.reduce((sum, p) => sum + p.reward, 0);

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
          
          <h1 className="text-4xl font-bold mb-2">Rewards & Treasury</h1>
          <p className="text-xl text-muted-foreground">
            Earn tokens and rewards for your wellness achievements and proof submissions
          </p>
        </div>

        {/* Token Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ascend Tokens</CardTitle>
              <Coins className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{mockTokenBalance}</div>
              <p className="text-xs text-muted-foreground">From proof submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staked Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{mockStakedAmount}</div>
              <p className="text-xs text-muted-foreground">earning {mockYieldRate}% APY</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Proofs</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{verifiedProofs}</div>
              <p className="text-xs text-muted-foreground">successful submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {rewards.reduce((sum, reward) => sum + Number(reward.amount), 0) + totalProofRewards}
              </div>
              <p className="text-xs text-muted-foreground">lifetime rewards</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
            <TabsTrigger value="proofs">Proof History</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Available Milestones
                </CardTitle>
                <p className="text-muted-foreground">
                  Complete these challenges to earn ASCEND tokens
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium">{milestone.reward} tokens</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {milestone.completed ? (
                          <Badge variant="default" className="bg-green-600">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            In Progress
                          </Badge>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => handleClaimReward(milestone)}
                          disabled={!milestone.completed || addReward.isPending}
                        >
                          {milestone.completed ? 'Claim' : 'Locked'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievement Badges
                </CardTitle>
                <p className="text-muted-foreground">
                  Your collection of wellness achievements
                </p>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="p-4 border rounded-lg text-center">
                        <img 
                          src="/assets/generated/achievement-badge.png" 
                          alt="Badge"
                          className="w-16 h-16 mx-auto mb-3"
                        />
                        <h3 className="font-semibold">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Earned {new Date(Number(badge.dateEarned)).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
                    <p className="text-muted-foreground">
                      Complete wellness activities to earn your first badge!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treasury" className="space-y-6">
            <AscendTokenRewards />
            
            <Card>
              <CardHeader>
                <CardTitle>Token Staking</CardTitle>
                <p className="text-muted-foreground">
                  Stake your ASCEND tokens to earn passive rewards
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Staking Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {mockStakedAmount} / {mockTokenBalance} tokens
                    </span>
                  </div>
                  <Progress value={(mockStakedAmount / mockTokenBalance) * 100} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Current APY</h4>
                    <div className="text-2xl font-bold text-green-600">{mockYieldRate}%</div>
                    <p className="text-sm text-muted-foreground">Annual percentage yield</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Daily Earnings</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((mockStakedAmount * mockYieldRate / 100 / 365) * 100) / 100}
                    </div>
                    <p className="text-sm text-muted-foreground">tokens per day</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleStakeTokens} className="flex-1">
                    Stake Tokens
                  </Button>
                  <Button onClick={handleUnstakeTokens} variant="outline" className="flex-1">
                    Unstake Tokens
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proofs" className="space-y-6">
            <ProofHistoryDashboard />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reward History</CardTitle>
                <p className="text-muted-foreground">
                  Track all your earned rewards and token transactions
                </p>
              </CardHeader>
              <CardContent>
                {rewards.length > 0 || proofHistory.length > 0 ? (
                  <div className="space-y-3">
                    {/* Proof rewards */}
                    {proofHistory.filter(p => p.verified).map((proof, index) => (
                      <div key={`proof-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Proof of Life Reward</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(Number(proof.timestamp)).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold">+{proof.reward}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Regular rewards */}
                    {rewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium capitalize">{reward.type} Reward</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(Number(reward.dateAwarded)).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold">+{Number(reward.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Coins className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rewards yet</h3>
                    <p className="text-muted-foreground">
                      Complete milestones and submit proof data to start earning rewards!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Rewards;
