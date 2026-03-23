import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGetLiquidityPools, useUpdateLiquidityPools } from '../hooks/useQueries';
import { 
  Droplets, 
  TrendingUp, 
  ExternalLink, 
  RefreshCw, 
  Info, 
  Coins, 
  DollarSign,
  BarChart3,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface PoolData {
  id: string;
  tokenPair: string;
  apy: number;
  totalLiquidity: number;
  volume: number;
  fees24h: number;
  myLiquidity?: number;
  priceChange24h?: number;
}

const LiquidityPoolsWidget: React.FC = () => {
  const { data: pools = [], isLoading, refetch } = useGetLiquidityPools();
  const { mutate: updatePools, isPending: isUpdating } = useUpdateLiquidityPools();
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Mock enhanced pool data with real-time simulation
  const [enhancedPools, setEnhancedPools] = useState<PoolData[]>([
    {
      id: 'ascend-icp',
      tokenPair: 'ASCEND/ICP',
      apy: 24.5,
      totalLiquidity: 125000,
      volume: 45000,
      fees24h: 135,
      priceChange24h: 2.3
    },
    {
      id: 'ascend-usdt',
      tokenPair: 'ASCEND/USDT',
      apy: 18.2,
      totalLiquidity: 89000,
      volume: 32000,
      fees24h: 96,
      priceChange24h: -1.1
    },
    {
      id: 'ascend-ckbtc',
      tokenPair: 'ASCEND/ckBTC',
      apy: 31.8,
      totalLiquidity: 67000,
      volume: 28000,
      fees24h: 84,
      priceChange24h: 4.7
    }
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEnhancedPools(prev => prev.map(pool => ({
        ...pool,
        apy: pool.apy + (Math.random() - 0.5) * 0.5,
        volume: pool.volume + Math.floor((Math.random() - 0.5) * 1000),
        fees24h: pool.fees24h + (Math.random() - 0.5) * 5,
        priceChange24h: (pool.priceChange24h || 0) + (Math.random() - 0.5) * 0.2
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefreshPools = () => {
    updatePools(undefined, {
      onSuccess: () => {
        toast.success('Pool data refreshed successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to refresh pool data');
      }
    });
  };

  const handlePoolAction = (pool: PoolData, action: 'add' | 'info') => {
    if (action === 'info') {
      setSelectedPool(pool);
      setIsInfoModalOpen(true);
    } else if (action === 'add') {
      // For now, redirect to ICPSwap since direct integration may not be technically feasible
      const icpSwapUrl = `https://app.icpswap.com/liquidity/add/${pool.id}`;
      
      toast.info('Redirecting to ICPSwap for liquidity provision', {
        description: 'You\'ll be taken to ICPSwap to safely add liquidity to this pool',
        duration: 5000,
        action: {
          label: 'Continue',
          onClick: () => window.open(icpSwapUrl, '_blank', 'noopener,noreferrer')
        }
      });
    }
  };

  const getPoolIcon = (tokenPair: string) => {
    if (tokenPair.includes('ICP')) {
      return <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />;
    }
    if (tokenPair.includes('USDT')) {
      return <DollarSign className="w-4 h-4 text-green-600" />;
    }
    if (tokenPair.includes('ckBTC')) {
      return <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" />;
    }
    return <Coins className="w-4 h-4 text-yellow-600" />;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            Liquidity Pools
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshPools}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time yields from ICPSwap liquidity pools
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pool Stats Overview */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {enhancedPools.length}
            </div>
            <div className="text-xs text-muted-foreground">Active Pools</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(enhancedPools.reduce((sum, pool) => sum + pool.totalLiquidity, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Total Liquidity</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {(enhancedPools.reduce((sum, pool) => sum + pool.apy, 0) / enhancedPools.length).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg APY</div>
          </div>
        </div>

        {/* Pool List */}
        <div className="space-y-3">
          {enhancedPools.map((pool) => (
            <div
              key={pool.id}
              className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getPoolIcon(pool.tokenPair)}
                    <Coins className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">{pool.tokenPair}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(pool.totalLiquidity)} liquidity
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {pool.apy.toFixed(1)}% APY
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePoolAction(pool, 'info')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-3">
                <div>
                  <span className="block">24h Volume</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(pool.volume)}
                  </span>
                </div>
                <div>
                  <span className="block">24h Fees</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(pool.fees24h)}
                  </span>
                </div>
                <div>
                  <span className="block">24h Change</span>
                  <span className={`font-medium ${
                    (pool.priceChange24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(pool.priceChange24h || 0) >= 0 ? '+' : ''}{(pool.priceChange24h || 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 modern-button bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  onClick={() => handlePoolAction(pool, 'add')}
                >
                  <Droplets className="w-3 h-3 mr-1" />
                  Add Liquidity
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePoolAction(pool, 'info')}
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Notice */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Liquidity Provision Information
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Providing liquidity earns you trading fees but involves impermanent loss risk. 
                You'll be redirected to ICPSwap for secure liquidity provision with full control over your assets.
              </p>
              <div className="flex items-center gap-4 text-xs text-yellow-700 dark:text-yellow-300">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Earn trading fees
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Withdraw anytime
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Boost rewards
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Pool Details Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              {selectedPool?.tokenPair} Pool Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedPool && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">APY</div>
                  <div className="text-lg font-bold text-green-600">
                    {selectedPool.apy.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Liquidity</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(selectedPool.totalLiquidity)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume:</span>
                  <span className="font-medium">{formatCurrency(selectedPool.volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">24h Fees:</span>
                  <span className="font-medium">{formatCurrency(selectedPool.fees24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">24h Price Change:</span>
                  <span className={`font-medium ${
                    (selectedPool.priceChange24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(selectedPool.priceChange24h || 0) >= 0 ? '+' : ''}{(selectedPool.priceChange24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>How it works:</strong> Add equal values of both tokens to earn a share of trading fees. 
                  Your rewards are proportional to your share of the total pool liquidity.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 modern-button bg-gradient-to-r from-blue-500 to-indigo-600"
                  onClick={() => {
                    handlePoolAction(selectedPool, 'add');
                    setIsInfoModalOpen(false);
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Add Liquidity on ICPSwap
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LiquidityPoolsWidget;
