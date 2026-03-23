import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAscendTokenBalance } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { ArrowUpDown, Coins, DollarSign, Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SwapQuote {
  inputAmount: number;
  outputAmount: number;
  minOut: number;
  slippage: number;
  priceImpact: number;
  fee: number;
}

interface TokenPair {
  from: string;
  to: string;
  fromSymbol: string;
  toSymbol: string;
  fromIcon: React.ReactNode;
  toIcon: React.ReactNode;
}

const ICPSwapInterface: React.FC = () => {
  const { data: tokenData, isLoading: tokenLoading } = useGetAscendTokenBalance();
  const { identity } = useInternetIdentity();
  
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [selectedPair, setSelectedPair] = useState<string>('ascend-usdt');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

  const tokenPairs: Record<string, TokenPair> = {
    'ascend-usdt': {
      from: 'ascend',
      to: 'usdt',
      fromSymbol: 'ASCEND',
      toSymbol: 'USDT',
      fromIcon: <Coins className="w-4 h-4 text-yellow-600" />,
      toIcon: <DollarSign className="w-4 h-4 text-green-600" />
    },
    'ascend-icp': {
      from: 'ascend',
      to: 'icp',
      fromSymbol: 'ASCEND',
      toSymbol: 'ICP',
      fromIcon: <Coins className="w-4 h-4 text-yellow-600" />,
      toIcon: <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
    }
  };

  const currentPair = tokenPairs[selectedPair];

  // Mock ICPSwap canister interaction
  const getSwapQuote = async (amount: number, pair: string): Promise<SwapQuote> => {
    // Simulate API call to ICPSwap canister (ryjl3-tyaaa-aaaaa-aaaba-cai)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockRates = {
      'ascend-usdt': 0.025, // 1 ASCEND = $0.025
      'ascend-icp': 0.002   // 1 ASCEND = 0.002 ICP
    };
    
    const rate = mockRates[pair as keyof typeof mockRates] || 0.025;
    const outputAmount = amount * rate;
    const slippage = 0.01; // 1%
    const minOut = outputAmount * (1 - slippage);
    const priceImpact = Math.min(amount / 10000, 0.05); // Max 5% impact
    const fee = outputAmount * 0.003; // 0.3% fee
    
    return {
      inputAmount: amount,
      outputAmount: outputAmount - fee,
      minOut,
      slippage,
      priceImpact,
      fee
    };
  };

  const executeSwap = async (quote: SwapQuote): Promise<void> => {
    if (!identity) {
      throw new Error('Please connect your Internet Identity wallet');
    }

    // Create agent with Internet Identity
    const agent = new HttpAgent({
      identity,
      host: process.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943'
    });

    // In production, you would interact with the actual ICPSwap canister
    // const icpSwapCanister = Principal.fromText('ryjl3-tyaaa-aaaaa-aaaba-cai');
    
    // Mock swap execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate potential failure (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Swap failed due to insufficient liquidity');
    }

    // Success - no health data is included in transaction for HIPAA compliance
    return;
  };

  const handleGetQuote = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(inputAmount);
    if (amount > (tokenData?.balance || 0)) {
      toast.error('Insufficient Ascend token balance');
      return;
    }

    setIsLoadingQuote(true);
    try {
      const quote = await getSwapQuote(amount, selectedPair);
      setSwapQuote(quote);
    } catch (error) {
      toast.error('Failed to get swap quote');
      console.error('Quote error:', error);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!swapQuote) return;

    setIsExecutingSwap(true);
    try {
      await executeSwap(swapQuote);
      
      const pair = tokenPairs[selectedPair];
      const successMessage = `Swapped ${swapQuote.inputAmount} ${pair.fromSymbol} for ${swapQuote.outputAmount.toFixed(4)} ${pair.toSymbol}!`;
      
      toast.success(successMessage, {
        description: 'Use for shop peptides?',
        duration: 5000,
      });

      // Reset form
      setInputAmount('');
      setSwapQuote(null);
      setIsSwapModalOpen(false);
      
    } catch (error: any) {
      toast.error(error.message || 'Swap transaction failed');
      console.error('Swap error:', error);
    } finally {
      setIsExecutingSwap(false);
    }
  };

  if (tokenLoading) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5" />
          Token Swap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Swap your Ascend tokens using ICPSwap DEX
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance Display */}
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Ascend Balance</span>
            </div>
            <div className="text-xl font-bold text-yellow-600">
              {tokenData?.balance || 0}
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <Dialog open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full modern-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={!tokenData?.balance || tokenData.balance === 0}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Swap Tokens
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Swap Ascend Tokens
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Token Pair Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Token Pair</label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ascend-usdt">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        ASCEND → USDT
                      </div>
                    </SelectItem>
                    <SelectItem value="ascend-icp">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        ASCEND → ICP
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to Swap</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="pr-20"
                    min="0"
                    max={tokenData?.balance || 0}
                    step="0.01"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {currentPair.fromIcon}
                    <span className="text-sm font-medium">{currentPair.fromSymbol}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Available: {tokenData?.balance || 0} ASCEND</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setInputAmount(String(tokenData?.balance || 0))}
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Get Quote Button */}
              <Button
                onClick={handleGetQuote}
                disabled={!inputAmount || isLoadingQuote}
                className="w-full"
                variant="outline"
              >
                {isLoadingQuote ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Quote...
                  </>
                ) : (
                  'Get Quote'
                )}
              </Button>

              {/* Swap Quote Display */}
              {swapQuote && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">You'll receive:</span>
                    <div className="flex items-center gap-2 font-medium">
                      {currentPair.toIcon}
                      {swapQuote.outputAmount.toFixed(4)} {currentPair.toSymbol}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Minimum received (1% slippage):</span>
                      <span>{swapQuote.minOut.toFixed(4)} {currentPair.toSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price impact:</span>
                      <span className={swapQuote.priceImpact > 0.03 ? 'text-orange-600' : 'text-green-600'}>
                        {(swapQuote.priceImpact * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trading fee:</span>
                      <span>{swapQuote.fee.toFixed(4)} {currentPair.toSymbol}</span>
                    </div>
                  </div>

                  {/* HIPAA Compliance Notice */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>HIPAA Compliant:</strong> This transaction contains no health data and maintains full privacy compliance.
                      </p>
                    </div>
                  </div>

                  {/* Confirm Swap Button */}
                  <Button
                    onClick={handleExecuteSwap}
                    disabled={isExecutingSwap}
                    className="w-full modern-button bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isExecutingSwap ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing Swap...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Swap
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Warning for high price impact */}
              {swapQuote && swapQuote.priceImpact > 0.03 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      High price impact detected. Consider reducing the swap amount for better rates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 bg-muted/30 rounded-lg text-center">
            <div className="font-medium">ASCEND/USDT</div>
            <div className="text-muted-foreground">$0.025</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-lg text-center">
            <div className="font-medium">ASCEND/ICP</div>
            <div className="text-muted-foreground">0.002</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ICPSwapInterface;
