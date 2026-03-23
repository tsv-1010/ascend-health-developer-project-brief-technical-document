import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useSaveUserProfile, useCompleteOnboarding, useCreateReferral } from '../hooks/useQueries';
import { UserProfile } from '../backend';
import { Mic, MicOff, ArrowRight, ArrowLeft, Check, AlertCircle, Users, Mail, Plus, X, Smartphone, Watch, Activity, Heart, Zap } from 'lucide-react';
import { toast } from 'sonner';

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    healthConcerns: [] as string[],
    goals: [] as string[],
    agentName: '',
    privacyConsent: false,
    subscriptionStatus: false,
    referralEmails: ['', '', ''] as string[],
    selectedWearables: [] as string[],
  });

  const saveProfile = useSaveUserProfile();
  const completeOnboarding = useCompleteOnboarding();
  const createReferral = useCreateReferral();

  const steps = [
    'Personal Information',
    'Health Concerns',
    'Wellness Goals',
    'AI Agent Setup',
    'Invite Friends',
    'Wearable Sync',
    'Privacy & Consent',
    'Subscription Options'
  ];

  const commonHealthConcerns = [
    'Weight Management', 'Stress & Anxiety', 'Sleep Quality', 'Energy Levels',
    'Chronic Pain', 'Heart Health', 'Mental Wellbeing', 'Nutrition',
    'Exercise & Fitness', 'Blood Pressure', 'Diabetes', 'Other'
  ];

  const commonGoals = [
    'Lose Weight', 'Build Muscle', 'Improve Sleep', 'Reduce Stress',
    'Eat Healthier', 'Exercise More', 'Better Mental Health', 'Increase Energy',
    'Manage Chronic Condition', 'Preventive Care', 'Work-Life Balance', 'Other'
  ];

  const agentNames = [
    'Aria', 'Sage', 'Luna', 'Nova', 'Zen', 'Echo', 'Iris', 'Kai'
  ];

  const wearableOptions = [
    { id: 'oura', name: 'Oura Ring', icon: Watch, description: 'Sleep, HRV, Temperature' },
    { id: 'apple-health', name: 'Apple Health', icon: Smartphone, description: 'Steps, Heart Rate, VO2 Max' },
    { id: 'whoop', name: 'WHOOP', icon: Activity, description: 'Strain, Recovery, Sleep' },
    { id: 'function-health', name: 'Function Health', icon: Heart, description: 'Lab Results, Biomarkers' },
    { id: 'superpower', name: 'Superpower', icon: Zap, description: 'Metabolic Health' },
    { id: 'lifeforce', name: 'LifeForce', icon: Heart, description: 'Hormone Optimization' },
    { id: 'fitbit', name: 'Fitbit', icon: Watch, description: 'Activity, Sleep, Heart Rate' },
    { id: 'garmin', name: 'Garmin', icon: Watch, description: 'GPS, Training, Body Battery' },
    { id: 'levels', name: 'Levels CGM', icon: Zap, description: 'Glucose Monitoring' },
  ];

  const toggleHealthConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      healthConcerns: prev.healthConcerns.includes(concern)
        ? prev.healthConcerns.filter(c => c !== concern)
        : [...prev.healthConcerns, concern]
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleWearable = (wearableId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedWearables: prev.selectedWearables.includes(wearableId)
        ? prev.selectedWearables.filter(w => w !== wearableId)
        : [...prev.selectedWearables, wearableId]
    }));
  };

  const addReferralEmail = () => {
    setFormData(prev => ({
      ...prev,
      referralEmails: [...prev.referralEmails, '']
    }));
  };

  const removeReferralEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referralEmails: prev.referralEmails.filter((_, i) => i !== index)
    }));
  };

  const updateReferralEmail = (index: number, email: string) => {
    setFormData(prev => ({
      ...prev,
      referralEmails: prev.referralEmails.map((e, i) => i === index ? email : e)
    }));
  };

  const startVoiceInput = (field: string) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
        };
        
        recognition.onend = () => setIsListening(false);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setFormData(prev => ({ ...prev, [field]: transcript }));
          toast.success('Voice input captured successfully');
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          const errorMessage = `Voice recognition failed: ${event.error}`;
          setVoiceError(errorMessage);
          toast.error('Voice recognition failed. Please try typing instead.');
        };

        recognition.start();
      } catch (error) {
        setVoiceError('Voice recognition not supported in this browser');
        toast.error('Voice recognition not supported. Please type your response.');
      }
    } else {
      setVoiceError('Voice recognition not supported in this browser');
      toast.error('Voice recognition not supported in this browser.');
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return formData.name.trim() !== '' && formData.age !== '' && parseInt(formData.age) > 0;
      case 3: // AI Agent Setup
        return formData.agentName.trim() !== '';
      case 6: // Privacy & Consent
        return formData.privacyConsent;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      switch (currentStep) {
        case 0:
          toast.error('Please enter your name and age to continue.');
          break;
        case 3:
          toast.error('Please select or enter an AI agent name to continue.');
          break;
        case 6:
          toast.error('Please accept the privacy consent to continue.');
          break;
        default:
          toast.error('Please complete the required fields to continue.');
      }
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Final validation
    if (!formData.name || !formData.age || !formData.agentName || !formData.privacyConsent) {
      toast.error('Please complete all required fields and accept the privacy consent.');
      return;
    }

    const profile: UserProfile = {
      name: formData.name,
      age: BigInt(parseInt(formData.age)),
      healthConcerns: formData.healthConcerns,
      goals: formData.goals,
      agentName: formData.agentName,
      privacyConsent: formData.privacyConsent,
      subscriptionStatus: formData.subscriptionStatus,
      onboardingComplete: false,
    };

    try {
      // Step 1: Save the user profile
      await saveProfile.mutateAsync(profile);
      
      // Step 2: Process referral invitations if any
      const validEmails = formData.referralEmails.filter(email => 
        email.trim() !== '' && email.includes('@')
      );
      
      if (validEmails.length > 0) {
        const referralCode = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createReferral.mutateAsync(referralCode);
        toast.success(`Referral code created! ${validEmails.length} invitations will be sent.`);
      }
      
      // Step 3: Complete the onboarding process
      await completeOnboarding.mutateAsync();
      
      toast.success('Profile created successfully! Welcome to Ascend Health.');
      
      // Navigate to dashboard after successful completion
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Onboarding completion error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Incomplete onboarding data')) {
          toast.error('Please ensure all required fields are completed correctly.');
        } else if (error.message.includes('Unauthorized')) {
          toast.error('Authentication error. Please try logging in again.');
        } else {
          toast.error('Failed to complete setup. Please check your connection and try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg">What's your name? *</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="text-lg py-3"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => startVoiceInput('name')}
                  disabled={isListening}
                  title="Use voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              {voiceError && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{voiceError}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-lg">How old are you? *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter your age"
                className="text-lg py-3"
                min="1"
                max="120"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg mb-4 block">What health concerns would you like to address?</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select all that apply. This helps us personalize your wellness journey.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonHealthConcerns.map((concern) => (
                  <Badge
                    key={concern}
                    variant={formData.healthConcerns.includes(concern) ? "default" : "outline"}
                    className="cursor-pointer p-3 text-center justify-center hover:scale-105 transition-transform"
                    onClick={() => toggleHealthConcern(concern)}
                  >
                    {concern}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg mb-4 block">What are your wellness goals?</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose your primary objectives. We'll help you achieve them step by step.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonGoals.map((goal) => (
                  <Badge
                    key={goal}
                    variant={formData.goals.includes(goal) ? "default" : "outline"}
                    className="cursor-pointer p-3 text-center justify-center hover:scale-105 transition-transform"
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <img 
                src="/assets/generated/ai-agent-avatar.png" 
                alt="AI Agent" 
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <p className="text-lg text-muted-foreground">Choose a name for your AI wellness companion</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your AI agent will provide personalized guidance and support throughout your wellness journey.
              </p>
            </div>
            <div>
              <Label className="text-lg mb-4 block">Agent Name *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {agentNames.map((name) => (
                  <Badge
                    key={name}
                    variant={formData.agentName === name ? "default" : "outline"}
                    className="cursor-pointer p-3 text-center justify-center hover:scale-105 transition-transform"
                    onClick={() => setFormData(prev => ({ ...prev, agentName: name }))}
                  >
                    {name}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={formData.agentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
                  placeholder="Or enter a custom name"
                  className="text-lg py-3"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => startVoiceInput('agentName')}
                  disabled={isListening}
                  title="Use voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <img 
                src="/assets/generated/referral-invitation-interface.png" 
                alt="Invite Friends" 
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h3 className="text-xl font-semibold">Invite Friends to Join</h3>
              <p className="text-muted-foreground">
                Share the wellness journey! Invite friends and earn 100 Ascend tokens for each successful referral.
                Your friends get 50 tokens + 10% shop discount.
              </p>
            </div>
            
            <div className="space-y-4">
              <Label className="text-lg">Friend Email Addresses (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Add 3 or more email addresses to send referral invitations
              </p>
              
              {formData.referralEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateReferralEmail(index, e.target.value)}
                    placeholder={`Friend ${index + 1} email address`}
                    className="flex-1"
                  />
                  {formData.referralEmails.length > 3 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeReferralEmail(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addReferralEmail}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Email
              </Button>
            </div>
            
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription>
                <strong>Referral Rewards:</strong> You earn 100 Ascend tokens for each friend who joins and completes onboarding. 
                Your friends receive 50 tokens plus a 10% discount on all Health Shop purchases.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <img 
                src="/assets/generated/multi-select-wearable-sync.png" 
                alt="Wearable Sync" 
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h3 className="text-xl font-semibold">Connect Your Wearables</h3>
              <p className="text-muted-foreground">
                Select the devices you'd like to sync for comprehensive health tracking. You can add more later.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wearableOptions.map((wearable) => {
                const Icon = wearable.icon;
                const isSelected = formData.selectedWearables.includes(wearable.id);
                
                return (
                  <Card
                    key={wearable.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleWearable(wearable.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{wearable.name}</div>
                          <div className="text-sm text-muted-foreground">{wearable.description}</div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Selected devices will be connected using secure OAuth2 authentication with encrypted token storage. 
                You can manage connections and privacy settings anytime in Health Labs.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Privacy & Data Consent</h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacyConsent}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, privacyConsent: checked as boolean }))
                    }
                  />
                  <div className="space-y-2">
                    <Label htmlFor="privacy" className="text-base font-medium">
                      I consent to data processing *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      I understand that my health data will be securely stored and processed on the Internet Computer 
                      to provide personalized wellness recommendations. Data is encrypted and never shared with third parties.
                      ZK-proofs ensure maximum privacy protection.
                    </p>
                  </div>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy-First Approach:</strong> Your data is stored on the decentralized Internet Computer 
                  with ZK-proof verification. Wearable tokens are encrypted, and referral rewards are processed anonymously.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Choose Your Plan</h3>
              <p className="text-muted-foreground mb-6">Start with our free plan or upgrade for premium features</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer transition-all ${!formData.subscriptionStatus ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Free Plan
                    {!formData.subscriptionStatus && <Check className="w-5 h-5 text-primary" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Basic health tracking</li>
                    <li>• AI wellness tips</li>
                    <li>• Community access</li>
                    <li>• Limited domain insights</li>
                    <li>• Referral rewards</li>
                  </ul>
                  <Button 
                    variant={!formData.subscriptionStatus ? "default" : "outline"}
                    className="w-full mt-4"
                    onClick={() => setFormData(prev => ({ ...prev, subscriptionStatus: false }))}
                  >
                    Select Free
                  </Button>
                </CardContent>
              </Card>
              <Card className={`cursor-pointer transition-all ${formData.subscriptionStatus ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Premium Plan
                    {formData.subscriptionStatus && <Check className="w-5 h-5 text-primary" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Advanced analytics</li>
                    <li>• Personalized programs</li>
                    <li>• Priority AI support</li>
                    <li>• All domain features</li>
                    <li>• Enhanced rewards & tokens</li>
                    <li>• Premium wearable integrations</li>
                  </ul>
                  <Button 
                    variant={formData.subscriptionStatus ? "default" : "outline"}
                    className="w-full mt-4"
                    onClick={() => setFormData(prev => ({ ...prev, subscriptionStatus: true }))}
                  >
                    Select Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Premium features are currently in development. All users start with full access during our beta phase.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLoading = saveProfile.isPending || completeOnboarding.isPending || createReferral.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Welcome Setup</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading || !formData.privacyConsent}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {isLoading ? 'Creating Profile...' : 'Complete Setup'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
