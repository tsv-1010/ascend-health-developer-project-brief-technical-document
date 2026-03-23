import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useGetTourProgress, useSaveTourProgress } from '../hooks/useQueries';
import { TourProgress, TourStep } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle,
  Wallet,
  Activity,
  FlaskConical,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingTourProps {
  onComplete?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const { identity } = useInternetIdentity();
  const { data: tourProgress, isLoading } = useGetTourProgress();
  const saveTourProgress = useSaveTourProgress();
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Ascend Health! 🎉',
      description: 'Let me show you around the key features that will help you optimize your health and wellness journey.',
      target: 'dashboard',
      order: BigInt(0),
      completed: false
    },
    {
      id: 'ai-chat',
      title: 'AI Health Assistant',
      description: 'Your personal AI assistant is always at the top of each page. Ask questions, get insights, and receive personalized recommendations powered by ICP-native LLM.',
      target: 'ai-chat',
      order: BigInt(1),
      completed: false
    },
    {
      id: 'wearable-sync',
      title: 'Connect Your Wearables',
      description: 'Sync data from Oura, WHOOP, Apple Health, and more. Your health data is encrypted and stored securely on-chain.',
      target: 'wearable-hub',
      order: BigInt(2),
      completed: false
    },
    {
      id: 'health-labs',
      title: 'Health Labs Dashboard',
      description: 'Track 100+ health indicators, create custom charts, and analyze your biomarkers with AI-powered insights.',
      target: 'health-labs',
      order: BigInt(3),
      completed: false
    },
    {
      id: 'defi-dashboard',
      title: 'DeFi & Rewards',
      description: 'Stake Ascend tokens, swap on ICPSwap, and earn rewards for your health achievements. All transactions are HIPAA-compliant.',
      target: 'defi',
      order: BigInt(4),
      completed: false
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'Use the floating action button for one-tap access to common tasks like syncing devices, claiming rewards, and asking AI for summaries.',
      target: 'quick-actions',
      order: BigInt(5),
      completed: false
    }
  ];

  useEffect(() => {
    if (!isLoading && !tourProgress && identity) {
      setShowWelcome(true);
    }
  }, [isLoading, tourProgress, identity]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setIsOpen(true);
    setCurrentStep(0);
  };

  const handleSkipTour = async () => {
    setShowWelcome(false);
    setIsOpen(false);
    
    if (identity) {
      const completedProgress: TourProgress = {
        userId: identity.getPrincipal(),
        steps: tourSteps.map(step => ({ ...step, completed: true })),
        completed: true,
        lastUpdated: BigInt(Date.now())
      };
      
      try {
        await saveTourProgress.mutateAsync(completedProgress);
        toast.success('Tour skipped. You can restart it anytime from Settings.');
      } catch (error) {
        console.error('Failed to save tour progress:', error);
      }
    }
    
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteTour = async () => {
    setIsOpen(false);
    
    if (identity) {
      const completedProgress: TourProgress = {
        userId: identity.getPrincipal(),
        steps: tourSteps.map(step => ({ ...step, completed: true })),
        completed: true,
        lastUpdated: BigInt(Date.now())
      };
      
      try {
        await saveTourProgress.mutateAsync(completedProgress);
        toast.success('🎉 Tour completed! You\'re all set to start your health journey.');
      } catch (error) {
        console.error('Failed to save tour progress:', error);
      }
    }
    
    onComplete?.();
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'ai-chat': return <Sparkles className="w-6 h-6" />;
      case 'wearable-sync': return <Activity className="w-6 h-6" />;
      case 'health-labs': return <FlaskConical className="w-6 h-6" />;
      case 'defi-dashboard': return <Wallet className="w-6 h-6" />;
      case 'quick-actions': return <Zap className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Welcome Modal */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Welcome to Ascend Health!
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              We're excited to have you here! Would you like a quick tour of the key features to help you get started?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">Health Tracking</span>
                </div>
                <p className="text-xs text-muted-foreground">100+ indicators from wearables</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-sm">DeFi Rewards</span>
                </div>
                <p className="text-xs text-muted-foreground">Earn tokens for health goals</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-sm">AI Assistant</span>
                </div>
                <p className="text-xs text-muted-foreground">On-chain AI insights</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-sm">Health Shop</span>
                </div>
                <p className="text-xs text-muted-foreground">Personalized products</p>
              </Card>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleSkipTour}
                className="flex-1"
              >
                Skip Tour
              </Button>
              <Button 
                onClick={handleStartTour}
                className="flex-1 modern-button"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Tour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tour Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                  {getStepIcon(currentTourStep.id)}
                </div>
                {currentTourStep.title}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSkipTour}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Step {currentStep + 1} of {tourSteps.length}</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              <p className="text-base leading-relaxed">{currentTourStep.description}</p>
              
              {/* Step-specific visual aids */}
              {currentTourStep.id === 'ai-chat' && (
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-1" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Try asking:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• "Show my health score trends"</li>
                        <li>• "Analyze my lab results"</li>
                        <li>• "Optimize my staking strategy"</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
              
              {currentTourStep.id === 'wearable-sync' && (
                <div className="grid grid-cols-3 gap-2">
                  {['Oura', 'WHOOP', 'Apple Health', 'Fitbit', 'Garmin', 'Levels'].map(device => (
                    <Badge key={device} variant="secondary" className="justify-center py-2">
                      {device}
                    </Badge>
                  ))}
                </div>
              )}
              
              {currentTourStep.id === 'defi-dashboard' && (
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                    <div className="text-sm font-semibold mb-1">Staking</div>
                    <div className="text-xs text-muted-foreground">Up to 25% APY</div>
                  </Card>
                  <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-semibold mb-1">Token Swaps</div>
                    <div className="text-xs text-muted-foreground">ICPSwap DEX</div>
                  </Card>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'bg-primary w-6' 
                        : index < currentStep 
                        ? 'bg-primary/50' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={handleNext}
                className="modern-button"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingTour;
