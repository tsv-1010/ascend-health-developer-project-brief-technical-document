import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, CreditCard, DollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AscendPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  productName: string;
  onSuccess?: () => void;
}

const AscendPayModal: React.FC<AscendPayModalProps> = ({
  isOpen,
  onClose,
  amount,
  productName,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'ascend' | 'usd' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);
    setStatus('processing');
    setProgress(0);

    // Simulate payment processing with progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('success');
      
      toast.success('Payment successful!');
      
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      setStatus('error');
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentMethod(null);
    setStatus('idle');
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            AscendPay Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="text-sm text-muted-foreground mb-1">Purchasing</div>
            <div className="font-semibold">{productName}</div>
            <div className="text-2xl font-bold mt-2">${amount}</div>
          </div>

          {/* Payment Method Selection */}
          {status === 'idle' && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Select Payment Method</div>
              
              <button
                onClick={() => setPaymentMethod('ascend')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'ascend'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <div className="text-left">
                      <div className="font-semibold">Ascend Tokens</div>
                      <div className="text-xs text-muted-foreground">Pay with your earned tokens</div>
                    </div>
                  </div>
                  <Badge variant="secondary">127 Available</Badge>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('usd')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'usd'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold">USD / Stablecoin</div>
                      <div className="text-xs text-muted-foreground">Pay with card or crypto</div>
                    </div>
                  </div>
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            </div>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="space-y-4 py-8">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <div className="font-semibold mb-2">Processing Payment...</div>
                <div className="text-sm text-muted-foreground">Please wait while we process your transaction</div>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="space-y-4 py-8 text-center">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-2">Payment Successful!</div>
                <div className="text-sm text-muted-foreground">Your order has been confirmed</div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-4 py-8 text-center">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-2">Payment Failed</div>
                <div className="text-sm text-muted-foreground">Please try again or contact support</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {status === 'idle' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={!paymentMethod || processing}
                className="flex-1"
              >
                {processing ? 'Processing...' : `Pay $${amount}`}
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStatus('idle')} className="flex-1">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AscendPayModal;
