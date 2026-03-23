import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAscendTokenBalance, useGetStakingPositions, useStakeTokens, useUnstakeTokens } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  Lock, 
  Unlock, 
  Shield, 
  TrendingUp, 
  Clock, 
  Coins, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Calculator,
  Calendar,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface StakingTier {
  days: number;
  multiplier: number;
  apy: number;
  label: string;
  color: string;
  description: string;
}

const AscendStakingInterface: React.FC = () => {
  const { data: tokenData, isLoading: tokenLoading } = useGetAscendTokenBalance();
  const { data: stakingPositions = [], isLoading: positionsLoading } = useGetStakingPositions();
  const { mutate: stakeTokens, isPending: isStaking } = useStakeTokens();
  const { mutate: unstakeTokens, isPending: isUnstaking } = useUnstakeTokens();
  const { identity } = useInternetIdentity();
  
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('30');
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const stakingTiers: StakingTier[] = [
    {
      days: 30,
      multiplier: 1.2,
      apy: 8.5,
      label: 'Starter',
      color: 'from-blue-400 to-blue-600',
      description: '1 month lockup with 20% reward boost'
    },
    {
      days: 90,
      multiplier: 1.5,
      apy: 12.0,
      label: 'Growth',
      color: 'from-green-400 to-green-600',
      description: '3 months lockup with 50% reward boost'
    },
    {
      days: 180,
      multiplier: 2.0,
      apy: 18.0,
      label: 'Premium',
      color: 'from-purple-400 to-purple-600',
      description: '6 months lockup with 100% reward boost'
    },
    {
      days: 365,
      multiplier: 3.0,
      apy: 25.0,
      label: 'Elite',
      color: 'from-yellow-400 to-orange-600',
      description: '1 year lockup with 200% reward boost'
    }
  ];

  const currentTier = stakingTiers.find(tier => tier.days === parseInt(selectedTier)) || stakingTiers[0];

  const calculateRewards = (amount: number, tier: StakingTier) => {
    const dailyRate = tier.apy / 365 / 100;
    const totalReward = amount * dailyRate * tier.days;
    return totalReward;
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount > (tokenData?.balance || 0)) {
      toast.error('Insufficient Ascend token balance');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum staking amount is 10 ASCEND tokens');
      return;
    }

    stakeTokens(
      { 
        amount: BigInt(Math.floor(amount)), 
        lockupPeriod: BigInt(currentTier.days) 
      },
      {
        onSuccess: () => {
          toast.success(`Successfully staked ${amount} ASCEND tokens for ${currentTier.days} days!`, {
            description: `Earning ${currentTier.apy}% APY with ${currentTier.multiplier}x reward multiplier`,
            duration: 5000,
          });
          setStakeAmount('');
          setIsStakeModalOpen(false);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to stake tokens');
        }
      }
    );
  };

  const handleUnstake = async (positionIndex: number) => {
    const position = stakingPositions[positionIndex];
    if (!position) return;

    const currentTime = Date.now();
    const lockupEndTime = Number(position.startTime) + (Number(position.lockupPeriod) * 24 * 60 * 60 * 1000);

    if (currentTime < lockupEndTime) {
      toast.error('Lockup period not yet completed');
      return;
    }

    unstakeTokens(
      BigInt(positionIndex),
      {
        onSuccess: () => {
          toast.success(`Successfully unstaked ${Number(position.amount)} ASCEND tokens!`, {
            description: 'Tokens and rewards have been returned to your balance',
            duration: 5000,
          });
          setSelectedPosition(null);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to unstake tokens');
        }
      }
    );
  };

  const getTimeRemaining = (startTime: bigint, lockupPeriod: bigint) => {
    const currentTime = Date.now();
    const lockupEndTime = Number(startTime) + (Number(lockupPeriod) * 24 * 60 * 60 * 1000);
    const timeRemaining = Math.max(0, lockupEndTime - currentTime);
    
    const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Unlocked';
  };

  const getProgressPercentage = (startTime: bigint, lockupPeriod: bigint) => {
    const currentTime = Date.now();
    const startTimeMs = Number(startTime);
    const lockupDurationMs = Number(lockupPeriod) * 24 * 60 * 60 * 1000;
    const elapsed = currentTime - startTimeMs;
    
    return Math.min(100, Math.max(0, (elapsed / lockupDurationMs) * 100));
  };

  const totalStaked = stakingPositions
    .filter(pos => pos.active)
    .reduce((sum, pos) => sum + Number(pos.amount), 0);

  const totalRewards = stakingPositions
    .filter(pos => pos.active)
    .reduce((sum, pos) => {
      const tier = stakingTiers.find(t => t.days === Number(pos.lockupPeriod)) || stakingTiers[0];
      return sum + calculateRewards(Number(pos.amount), tier);
    }, 0);

  if (tokenLoading || positionsLoading) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Staking Overview */}
      <Card className="modern-card bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Ascend Token Staking
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Lock your tokens for higher rewards with secure time-based vaults
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{tokenData?.balance || 0}</div>
              <p className="text-xs text-muted-foreground">ASCEND</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Staked</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{totalStaked}</div>
              <p className="text-xs text-muted-foreground">ASCEND</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Rewards</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{totalRewards.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">ASCEND</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Positions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stakingPositions.filter(pos => pos.active).length}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>

          {/* Stake Button */}
          <Dialog open={isStakeModalOpen} onOpenChange={setIsStakeModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full modern-button bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                disabled={!tokenData?.balance || tokenData.balance === 0}
              >
                <Lock className="w-4 h-4 mr-2" />
                Stake Tokens
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Stake Ascend Tokens
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Staking Tiers */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Staking Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                    {stakingTiers.map((tier) => (
                      <div
                        key={tier.days}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedTier === String(tier.days)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedTier(String(tier.days))}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>
                            {tier.label}
                          </Badge>
                          <span className="text-sm font-bold">{tier.apy}% APY</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {tier.days} days • {tier.multiplier}x multiplier
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tier.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount to Stake</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="pr-20"
                      min="10"
                      max={tokenData?.balance || 0}
                      step="1"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">ASCEND</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Available: {tokenData?.balance || 0} ASCEND</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => setStakeAmount(String(tokenData?.balance || 0))}
                    >
                      Max
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Minimum: 10 ASCEND tokens
                  </div>
                </div>

                {/* Reward Calculator */}
                {stakeAmount && parseFloat(stakeAmount) >= 10 && (
                  <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calculator className="w-4 h-4" />
                      Staking Summary
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Staking Amount:</span>
                        <span className="font-medium">{stakeAmount} ASCEND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lockup Period:</span>
                        <span className="font-medium">{currentTier.days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>APY:</span>
                        <span className="font-medium text-green-600">{currentTier.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reward Multiplier:</span>
                        <span className="font-medium text-purple-600">{currentTier.multiplier}x</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Estimated Rewards:</span>
                        <span className="text-green-600">
                          {calculateRewards(parseFloat(stakeAmount), currentTier).toFixed(2)} ASCEND
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <strong>Secure Staking:</strong> Your tokens are locked in a time-based smart contract vault with automatic reward distribution.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stake Button */}
                <Button
                  onClick={handleStake}
                  disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) < 10}
                  className="w-full modern-button bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  {isStaking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Staking Tokens...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Stake {stakeAmount || '0'} ASCEND
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Active Staking Positions */}
      {stakingPositions.filter(pos => pos.active).length > 0 && (
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Active Staking Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stakingPositions
              .filter(pos => pos.active)
              .map((position, index) => {
                const tier = stakingTiers.find(t => t.days === Number(position.lockupPeriod)) || stakingTiers[0];
                const timeRemaining = getTimeRemaining(position.startTime, position.lockupPeriod);
                const progress = getProgressPercentage(position.startTime, position.lockupPeriod);
                const isUnlocked = progress >= 100;
                const estimatedRewards = calculateRewards(Number(position.amount), tier);

                return (
                  <div key={index} className="p-4 bg-muted/30 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>
                          {tier.label}
                        </Badge>
                        <div>
                          <div className="font-medium">{Number(position.amount)} ASCEND</div>
                          <div className="text-sm text-muted-foreground">
                            {tier.apy}% APY • {tier.multiplier}x multiplier
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          {timeRemaining}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Number(position.lockupPeriod)} days total
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Rewards: </span>
                        <span className="font-medium text-green-600">
                          {estimatedRewards.toFixed(2)} ASCEND
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isUnlocked ? "default" : "outline"}
                        disabled={!isUnlocked || isUnstaking}
                        onClick={() => handleUnstake(index)}
                        className={isUnlocked ? "bg-gradient-to-r from-green-500 to-emerald-600" : ""}
                      >
                        {isUnstaking ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : isUnlocked ? (
                          <Unlock className="w-3 h-3 mr-1" />
                        ) : (
                          <Lock className="w-3 h-3 mr-1" />
                        )}
                        {isUnlocked ? 'Unstake' : 'Locked'}
                      </Button>
                    </div>

                    {!isUnlocked && (
                      <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
                          <AlertTriangle className="w-3 h-3" />
                          Tokens are locked until the staking period completes
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AscendStakingInterface;
