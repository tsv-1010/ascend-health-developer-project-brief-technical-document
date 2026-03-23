import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAscendTokenBalance, useGetStakingPositions } from '../hooks/useQueries';
import AIPageHeader from '../components/AIPageHeader';
import AscendStakingInterface from '../components/AscendStakingInterface';
import ICPSwapInterface from '../components/ICPSwapInterface';
import LiquidityPoolsWidget from '../components/LiquidityPoolsWidget';
import AscendTokenRewards from '../components/AscendTokenRewards';
import ReferralDashboard from '../components/ReferralDashboard';
import { 
  Wallet, 
  Copy, 
  Share2, 
  Coins, 
  Lock, 
  TrendingUp, 
  Shield, 
  Activity,
  Info,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const DefiDashboard: React.FC = () => {
  const { data: tokenData, isLoading: tokenLoading } = useGetAscendTokenBalance();
  const { data: stakingPositions = [], isLoading: positionsLoading } = useGetStakingPositions();
  const [isDeFi101Open, setIsDeFi101Open] = useState(false);
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

  const totalStaked = stakingPositions
    .filter(pos => pos.active)
    .reduce((sum, pos) => sum + Number(pos.amount), 0);

  const pendingRewards = stakingPositions
    .filter(pos => pos.active)
    .reduce((sum, pos) => {
      const dailyRate = 0.085 / 365; // 8.5% APY
      const daysStaked = Math.floor((Date.now() - Number(pos.startTime)) / (24 * 60 * 60 * 1000));
      return sum + (Number(pos.amount) * dailyRate * daysStaked);
    }, 0);

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied to clipboard!');
  };

  const shareWalletAddress = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Ascend Health Wallet',
        text: `My wallet address: ${walletAddress}`
      });
    } else {
      copyWalletAddress();
    }
  };

  // Mock canister status data
  const canisterStatus = {
    health: 'healthy',
    cyclesRemaining: 2.4,
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    uptime: 99.8
  };

  return (
    <div className="space-y-8">
      {/* AI Chat and Insights at the Very Top */}
      <AIPageHeader 
        pageContext="defi"
        insights="Your DeFi portfolio is performing well with 2.3% gains this week. You have 3 active staking positions earning rewards. Consider staking more tokens for higher APY. Your referral rewards are ready to claim!"
      />

      {/* Modern Wallet Summary Card */}
      <Card className="modern-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Wallet Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tokenLoading || positionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl cursor-help">
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium">Ascend Balance</span>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="text-3xl font-black text-yellow-600">
                          {tokenData?.balance || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Available for staking</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Your available Ascend tokens that can be staked or used in the Health Shop</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl cursor-help">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium">Staked Amount</span>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="text-3xl font-black text-purple-600">
                          {totalStaked}
                        </div>
                        <p className="text-xs text-muted-foreground">Locked in vaults</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Total tokens currently staked in time-locked positions earning rewards</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl cursor-help">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Pending Rewards</span>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="text-3xl font-black text-green-600">
                          {pendingRewards.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Accrued from staking</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Rewards earned from your active staking positions, claimable when you unstake</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl cursor-help">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">Total Value</span>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="text-3xl font-black text-blue-600">
                          {((tokenData?.balance || 0) + totalStaked + pendingRewards).toFixed(0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Combined portfolio</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Total value including available balance, staked tokens, and pending rewards</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Wallet Address */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">Wallet Address</div>
                    <div className="font-mono text-xs text-muted-foreground break-all">
                      {walletAddress}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={copyWalletAddress}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={shareWalletAddress}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Prominent Ascend Staking Interface */}
      <AscendStakingInterface />

      {/* ICPSwap Interface with Tabbed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ICPSwapInterface />
        <LiquidityPoolsWidget />
      </div>

      {/* Compact Ascend Token Rewards Summary */}
      <AscendTokenRewards />

      {/* Referral Dashboard Card at Bottom */}
      <ReferralDashboard />

      {/* Real-Time DeFi Status Display */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            DeFi System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  canisterStatus.health === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">Canister Health</span>
              </div>
              <div className="text-lg font-bold capitalize">{canisterStatus.health}</div>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Cycles Remaining</span>
              </div>
              <div className="text-lg font-bold">{canisterStatus.cyclesRemaining}T</div>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <div className="text-lg font-bold">{canisterStatus.uptime}%</div>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Privacy Status</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Protected</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Privacy Badge:</strong> All DeFi transactions are HIPAA-compliant and contain no health data. 
                Your financial activities are completely separate from your health information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DeFi 101 Educational Modal */}
      <Dialog open={isDeFi101Open} onOpenChange={setIsDeFi101Open}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full modern-button"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Learn DeFi Basics (DeFi 101)
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              DeFi 101: Understanding Decentralized Finance
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* What is DeFi */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                What is DeFi?
              </h3>
              <p className="text-sm text-muted-foreground">
                Decentralized Finance (DeFi) allows you to earn rewards, trade tokens, and provide liquidity 
                without traditional banks or intermediaries. Everything runs on blockchain smart contracts.
              </p>
            </div>

            {/* Staking */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                Staking
              </h3>
              <p className="text-sm text-muted-foreground">
                Lock your Ascend tokens for a set period to earn rewards. Longer lockup periods = higher APY (Annual Percentage Yield).
              </p>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-purple-600" />
                    <span><strong>30 days:</strong> 8.5% APY with 1.2x multiplier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-purple-600" />
                    <span><strong>90 days:</strong> 12% APY with 1.5x multiplier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-purple-600" />
                    <span><strong>180 days:</strong> 18% APY with 2x multiplier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-purple-600" />
                    <span><strong>365 days:</strong> 25% APY with 3x multiplier</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Swaps */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-600" />
                Token Swaps
              </h3>
              <p className="text-sm text-muted-foreground">
                Exchange your Ascend tokens for other cryptocurrencies like USDT or ICP using ICPSwap DEX. 
                Swaps include a small trading fee (typically 0.3%) and may have price impact based on liquidity.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span><strong>Slippage:</strong> Maximum price change you'll accept (default 1%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span><strong>Price Impact:</strong> How your trade affects the token price</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span><strong>Trading Fee:</strong> Small fee (0.3%) that goes to liquidity providers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liquidity Pools */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Liquidity Pools
              </h3>
              <p className="text-sm text-muted-foreground">
                Provide equal values of two tokens to a pool and earn a share of trading fees. 
                Your rewards are proportional to your share of the total pool liquidity.
              </p>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span><strong>Earn fees:</strong> Get a cut of every trade in the pool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span><strong>Withdraw anytime:</strong> Remove your liquidity whenever you want</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-orange-600" />
                    <span><strong>Impermanent loss:</strong> Risk if token prices diverge significantly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Rewards */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-yellow-600" />
                Referral Rewards
              </h3>
              <p className="text-sm text-muted-foreground">
                Invite friends to Ascend Health and earn 100 Ascend tokens for each successful referral. 
                Your friends get 50 tokens + 10% shop discount!
              </p>
            </div>

            {/* Safety Tips */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Safety Tips
              </h3>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>Never share your private keys or seed phrase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>Start with small amounts to learn how things work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>Understand lockup periods before staking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>Research tokens before swapping or providing liquidity</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setIsDeFi101Open(false)}
              className="w-full modern-button"
            >
              Got it! Let's start
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DefiDashboard;
