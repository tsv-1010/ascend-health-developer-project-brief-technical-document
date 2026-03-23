import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetCallerUserProfile, 
  useGetHealthIndicators, 
  useGetDomainProgress,
  useLLMQuery,
  useGetAscendTokenBalance
} from '../hooks/useQueries';
import { Product } from '../backend';
import { 
  ShoppingCart, 
  Coins, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  CreditCard,
  Loader2,
  Package,
  Shield,
  Info,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface CartItem extends Product {
  quantity: number;
}

interface AIProductRecommendation {
  product: Product;
  relevanceScore: number;
  reasoning: string;
  protocol: string;
}

const HealthShop: React.FC = () => {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: healthIndicators = [] } = useGetHealthIndicators();
  const { data: domainProgress = [] } = useGetDomainProgress();
  const { data: tokenData } = useGetAscendTokenBalance();
  const llmQuery = useLLMQuery();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'usd' | 'ascend'>('usd');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [recommendations, setRecommendations] = useState<AIProductRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  // Mock product catalog - in production, this would come from backend
  const baseProducts: Product[] = [
    {
      id: 'prod-001',
      name: 'Longevity Protocol Bundle',
      description: 'Comprehensive supplement stack for cellular health and longevity',
      price: BigInt(299),
      category: 'Supplements',
      vendor: 'LifeForce Labs',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    },
    {
      id: 'prod-002',
      name: 'Vitamin D3 + K2',
      description: 'High-potency vitamin D3 with K2 for bone and immune health',
      price: BigInt(45),
      category: 'Supplements',
      vendor: 'Pure Encapsulations',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    },
    {
      id: 'prod-003',
      name: 'Magnesium Glycinate',
      description: 'Highly absorbable magnesium for sleep and muscle recovery',
      price: BigInt(35),
      category: 'Supplements',
      vendor: 'Thorne Research',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    },
    {
      id: 'prod-004',
      name: 'Omega-3 Fish Oil',
      description: 'Ultra-pure EPA/DHA for heart and brain health',
      price: BigInt(55),
      category: 'Supplements',
      vendor: 'Nordic Naturals',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    },
    {
      id: 'prod-005',
      name: 'NAD+ Booster',
      description: 'NMN and resveratrol for cellular energy and anti-aging',
      price: BigInt(89),
      category: 'Supplements',
      vendor: 'Elysium Health',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    },
    {
      id: 'prod-006',
      name: 'Continuous Glucose Monitor',
      description: 'Real-time glucose tracking for metabolic optimization',
      price: BigInt(199),
      category: 'Devices',
      vendor: 'Levels',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    },
    {
      id: 'prod-007',
      name: 'Sleep Optimization Kit',
      description: 'Complete protocol for deep, restorative sleep',
      price: BigInt(149),
      category: 'Programs',
      vendor: 'Sleep Foundation',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    },
    {
      id: 'prod-008',
      name: 'Comprehensive Blood Panel',
      description: '100+ biomarkers for complete health assessment',
      price: BigInt(399),
      category: 'Testing',
      vendor: 'Function Health',
      recommended: false,
      ranking: BigInt(0),
      aiInfo: '',
      protocol: ''
    }
  ];

  // Generate AI-powered product recommendations on mount
  useEffect(() => {
    generateRecommendations();
  }, [healthIndicators, domainProgress, userProfile]);

  const generateRecommendations = async () => {
    setIsLoadingRecommendations(true);
    
    try {
      // Build context for LLM
      const healthContext = {
        indicatorCount: healthIndicators.length,
        domains: domainProgress.map(([domain, progress]) => ({
          domain: domain.toString(),
          score: Number(progress.score)
        })),
        concerns: userProfile?.healthConcerns || [],
        goals: userProfile?.goals || []
      };

      // Generate recommendations for each product using ICP-native LLM
      const recommendationPromises = baseProducts.map(async (product) => {
        try {
          const prompt = `Based on this user's health data: ${JSON.stringify(healthContext)}, 
          analyze the relevance of this product: ${product.name} (${product.description}).
          Provide: 1) A relevance score (0-100), 2) Why it's recommended, 3) A personalized protocol.
          Format: SCORE: [number] | REASON: [text] | PROTOCOL: [text]`;

          const result = await llmQuery.mutateAsync({
            prompt,
            context: 'shop'
          });

          // Parse LLM response - ensure it's a string
          const response = typeof result.response === 'string' ? result.response : String(result.response || '');
          const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
          const reasonMatch = response.match(/REASON:\s*([^|]+)/i);
          const protocolMatch = response.match(/PROTOCOL:\s*(.+)/i);

          const relevanceScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;
          const reasoning = reasonMatch ? reasonMatch[1].trim() : 'This product may support your health goals.';
          const protocol = protocolMatch ? protocolMatch[1].trim() : 'Follow standard dosage instructions.';

          return {
            product: {
              ...product,
              recommended: relevanceScore >= 70,
              ranking: BigInt(relevanceScore),
              aiInfo: reasoning,
              protocol: protocol
            },
            relevanceScore,
            reasoning,
            protocol
          };
        } catch (error) {
          console.error(`Failed to generate recommendation for ${product.name}:`, error);
          // Fallback recommendation
          return {
            product: {
              ...product,
              recommended: false,
              ranking: BigInt(50),
              aiInfo: 'This product may support your health goals.',
              protocol: 'Follow standard dosage instructions.'
            },
            relevanceScore: 50,
            reasoning: 'This product may support your health goals.',
            protocol: 'Follow standard dosage instructions.'
          };
        }
      });

      const results = await Promise.all(recommendationPromises);
      
      // Sort by relevance score
      const sorted = results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      setRecommendations(sorted);
      
      toast.success('Product recommendations generated', {
        description: 'Personalized based on your health data'
      });
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      // Use fallback recommendations
      const fallback = baseProducts.map((product, index) => ({
        product: {
          ...product,
          recommended: index < 3,
          ranking: BigInt(80 - index * 10),
          aiInfo: 'This product may support your health goals.',
          protocol: 'Follow standard dosage instructions.'
        },
        relevanceScore: 80 - index * 10,
        reasoning: 'This product may support your health goals.',
        protocol: 'Follow standard dosage instructions.'
      }));
      setRecommendations(fallback);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    toast.success('Added to cart', {
      description: product.name
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.info('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  };

  const calculateAscendTotal = () => {
    // Conversion rate: 1 USD = 0.5 Ascend tokens
    return Math.ceil(calculateTotal() * 0.5);
  };

  const hasReferralDiscount = userProfile?.name ? true : false; // Simplified check

  const applyReferralDiscount = (amount: number) => {
    return hasReferralDiscount ? amount * 0.9 : amount;
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const total = paymentMethod === 'usd' 
        ? applyReferralDiscount(calculateTotal())
        : calculateAscendTotal();
      
      // Check if user has enough Ascend tokens
      if (paymentMethod === 'ascend' && (tokenData?.balance || 0) < total) {
        throw new Error('Insufficient Ascend token balance');
      }
      
      // Simulate successful payment
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast.success('Payment successful!', {
        description: `Transaction ID: ${transactionId}. Your order will be processed shortly.`
      });
      
      // Clear cart and close checkout
      setCart([]);
      setIsCheckoutOpen(false);
      
      // Show next steps
      setTimeout(() => {
        toast.info('Order confirmation sent', {
          description: 'Check your email for tracking information.'
        });
      }, 1500);
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again or contact support.'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header with Cart */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text">AI-Powered Health Shop</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized recommendations based on your health data
          </p>
        </div>
        
        <Button
          variant="outline"
          className="relative"
          onClick={() => setIsCheckoutOpen(true)}
          disabled={cart.length === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Cart
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Referral Discount Banner */}
      {hasReferralDiscount && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Star className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>10% Referral Discount Active!</strong> Your discount will be applied at checkout.
          </AlertDescription>
        </Alert>
      )}

      {/* Product Grid */}
      {isLoadingRecommendations ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="modern-card">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(({ product, relevanceScore, reasoning, protocol }) => (
            <Card 
              key={product.id} 
              className={`modern-card transition-all hover:shadow-lg ${
                product.recommended ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.recommended && (
                        <Badge className="bg-primary/10 text-primary text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Top Pick
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {product.name}
                    </CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>{relevanceScore}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {product.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* AI-Generated Info Section */}
                <div className="space-y-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">
                          Why This is Recommended:
                        </p>
                        <p className="text-xs text-foreground leading-relaxed">
                          {reasoning}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">
                          Personalized Protocol:
                        </p>
                        <p className="text-xs text-foreground leading-relaxed">
                          {protocol}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">
                      ${hasReferralDiscount 
                        ? (Number(product.price) * 0.9).toFixed(0) 
                        : Number(product.price)}
                    </span>
                    {hasReferralDiscount && (
                      <span className="text-sm line-through text-muted-foreground">
                        ${Number(product.price)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Coins className="w-3 h-3 text-yellow-600" />
                    <span>or {Math.ceil(Number(product.price) * 0.5)} Ascend Tokens</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    by {product.vendor}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  className="w-full modern-button"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Checkout
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={isProcessingPayment}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <CardContent className="space-y-6 pt-6">
                {/* Cart Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Order Summary</h3>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isProcessingPayment}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isProcessingPayment}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${Number(item.price) * item.quantity}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        disabled={isProcessingPayment}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={paymentMethod === 'usd' ? 'default' : 'outline'}
                      className="h-auto py-4"
                      onClick={() => setPaymentMethod('usd')}
                      disabled={isProcessingPayment}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <span className="font-semibold">USD</span>
                        <span className="text-xs">
                          ${hasReferralDiscount 
                            ? applyReferralDiscount(calculateTotal()).toFixed(2)
                            : calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </Button>
                    
                    <Button
                      variant={paymentMethod === 'ascend' ? 'default' : 'outline'}
                      className="h-auto py-4"
                      onClick={() => setPaymentMethod('ascend')}
                      disabled={isProcessingPayment || (tokenData?.balance || 0) < calculateAscendTotal()}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Coins className="w-5 h-5" />
                        <span className="font-semibold">Ascend Tokens</span>
                        <span className="text-xs">
                          {calculateAscendTotal()} tokens
                        </span>
                        {(tokenData?.balance || 0) < calculateAscendTotal() && (
                          <Badge variant="destructive" className="text-xs">
                            Insufficient
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-2 p-4 bg-muted/30 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {paymentMethod === 'usd' 
                        ? `$${calculateTotal().toFixed(2)}`
                        : `${calculateAscendTotal()} tokens`}
                    </span>
                  </div>
                  
                  {hasReferralDiscount && paymentMethod === 'usd' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Referral Discount (10%):</span>
                      <span className="font-medium">
                        -${(calculateTotal() * 0.1).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      {paymentMethod === 'usd' 
                        ? `$${applyReferralDiscount(calculateTotal()).toFixed(2)}`
                        : `${calculateAscendTotal()} tokens`}
                    </span>
                  </div>
                  
                  {paymentMethod === 'ascend' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Shield className="w-3 h-3" />
                      <span>
                        Your balance: {tokenData?.balance || 0} tokens
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Processing Info */}
                {paymentMethod === 'ascend' && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Secure ICP Token Transfer:</strong> Tokens will be transferred directly to vendor wallets via native ICP protocol. 
                      Transaction will be recorded on-chain for transparency.
                    </AlertDescription>
                  </Alert>
                )}

                {paymentMethod === 'usd' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Payment Processing:</strong> USD payments are processed securely. 
                      Some vendors may require conversion to USDT/USDC for settlement.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </ScrollArea>

            <div className="border-t p-6">
              <Button
                className="w-full modern-button h-12 text-lg"
                onClick={processPayment}
                disabled={isProcessingPayment || cart.length === 0 || 
                  (paymentMethod === 'ascend' && (tokenData?.balance || 0) < calculateAscendTotal())}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Purchase
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HealthShop;
