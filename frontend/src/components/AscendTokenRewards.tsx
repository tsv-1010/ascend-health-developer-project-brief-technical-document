import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAscendTokenBalance } from '../hooks/useQueries';
import { Coins, TrendingUp, Target, Calendar } from 'lucide-react';

const AscendTokenRewards: React.FC = () => {
  const { data: tokenData, isLoading } = useGetAscendTokenBalance();

  // Mock data for demonstration
  const dailyGoal = 10;
  const weeklyGoal = 70;
  const monthlyGoal = 300;
  
  const currentWeeklyEarnings = 45;
  const currentMonthlyEarnings = 127;

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="/assets/generated/ascend-token-rewards.png" 
              alt="Ascend Tokens"
              className="w-6 h-6"
            />
            Ascend Token Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-16 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/assets/generated/ascend-token-rewards.png" 
            alt="Ascend Tokens"
            className="w-6 h-6"
          />
          Ascend Token Rewards
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Earn tokens through daily health data proof submissions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Balance Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">Current Balance</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {tokenData?.balance || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ascend Tokens</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {tokenData?.totalEarned || 0}
            </div>
            <p className="text-xs text-muted-foreground">All Time</p>
          </div>
        </div>

        {/* Earning Goals Progress */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4" />
            Earning Goals
          </h4>

          {/* Daily Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Daily Goal</span>
              <Badge variant="secondary">
                {dailyGoal}/{dailyGoal} tokens
              </Badge>
            </div>
            <Progress value={100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete daily health metrics to earn {dailyGoal} tokens
            </p>
          </div>

          {/* Weekly Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Weekly Goal</span>
              <Badge variant={currentWeeklyEarnings >= weeklyGoal ? "default" : "secondary"}>
                {currentWeeklyEarnings}/{weeklyGoal} tokens
              </Badge>
            </div>
            <Progress value={(currentWeeklyEarnings / weeklyGoal) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {weeklyGoal - currentWeeklyEarnings > 0 
                ? `${weeklyGoal - currentWeeklyEarnings} tokens needed to reach weekly goal`
                : 'Weekly goal achieved! 🎉'
              }
            </p>
          </div>

          {/* Monthly Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Monthly Goal</span>
              <Badge variant={currentMonthlyEarnings >= monthlyGoal ? "default" : "secondary"}>
                {currentMonthlyEarnings}/{monthlyGoal} tokens
              </Badge>
            </div>
            <Progress value={(currentMonthlyEarnings / monthlyGoal) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {monthlyGoal - currentMonthlyEarnings > 0 
                ? `${monthlyGoal - currentMonthlyEarnings} tokens needed to reach monthly goal`
                : 'Monthly goal achieved! 🎉'
              }
            </p>
          </div>
        </div>

        {/* Earning Summary */}
        <div className="p-4 bg-muted/30 rounded-xl">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Recent Earnings
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">10</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{currentWeeklyEarnings}</div>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{currentMonthlyEarnings}</div>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </div>
        </div>

        {/* Token Usage Info */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Use your tokens:</strong> Spend Ascend tokens in the Health Shop or stake them in the DeFi Dashboard for additional rewards!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AscendTokenRewards;
