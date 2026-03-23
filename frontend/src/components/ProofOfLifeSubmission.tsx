import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubmitDailyHealthData } from '../hooks/useQueries';
import { Activity, Apple, Moon, Shield, CheckCircle, AlertTriangle, Coins } from 'lucide-react';
import { toast } from 'sonner';

const ProofOfLifeSubmission: React.FC = () => {
  const [steps, setSteps] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [sleep, setSleep] = useState<number>(0);
  const submitHealthData = useSubmitDailyHealthData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (steps <= 0 || protein <= 0 || sleep <= 0) {
      toast.error('Please enter valid values for all health metrics');
      return;
    }

    try {
      const proof = await submitHealthData.mutateAsync({ steps, protein, sleep });
      
      if (proof.verified) {
        toast.success(`🎉 Proof verified! Earned ${proof.reward} Ascend tokens`);
      } else {
        toast.info('Proof submitted but did not meet minimum thresholds for rewards');
      }
      
      // Reset form
      setSteps(0);
      setProtein(0);
      setSleep(0);
    } catch (error) {
      toast.error('Failed to submit health data proof');
    }
  };

  const meetsThreshold = (value: number, threshold: number) => value >= threshold;
  const stepsValid = meetsThreshold(steps, 10000);
  const proteinValid = meetsThreshold(protein, 100);
  const sleepValid = meetsThreshold(sleep, 7);
  const allValid = stepsValid && proteinValid && sleepValid;

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/assets/generated/proof-submission-interface.png" 
            alt="Proof Submission"
            className="w-6 h-6"
          />
          Daily Health Data Submission
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Submit your daily health metrics to earn Ascend tokens. Only cryptographic hashes are stored for privacy.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Privacy Notice */}
        <Alert className="border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy First:</strong> Only cryptographic hashes of your health data are stored, never raw values. 
            Your actual health metrics remain completely private and secure.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Steps Input */}
          <div className="space-y-2">
            <Label htmlFor="steps" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Daily Steps
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="steps"
                type="number"
                value={steps || ''}
                onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
                placeholder="Enter daily steps"
                className="flex-1"
                min="0"
                max="50000"
              />
              <Badge variant={stepsValid ? "default" : "secondary"} className="min-w-fit">
                {stepsValid ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {stepsValid ? 'Valid' : '10k+ needed'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 10,000 steps required for token reward
            </p>
          </div>

          {/* Protein Input */}
          <div className="space-y-2">
            <Label htmlFor="protein" className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Protein Intake (grams)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="protein"
                type="number"
                value={protein || ''}
                onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                placeholder="Enter protein grams"
                className="flex-1"
                min="0"
                max="500"
              />
              <Badge variant={proteinValid ? "default" : "secondary"} className="min-w-fit">
                {proteinValid ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {proteinValid ? 'Valid' : '100g+ needed'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 100 grams protein required for token reward
            </p>
          </div>

          {/* Sleep Input */}
          <div className="space-y-2">
            <Label htmlFor="sleep" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Sleep Hours
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="sleep"
                type="number"
                value={sleep || ''}
                onChange={(e) => setSleep(parseInt(e.target.value) || 0)}
                placeholder="Enter sleep hours"
                className="flex-1"
                min="0"
                max="24"
                step="0.5"
              />
              <Badge variant={sleepValid ? "default" : "secondary"} className="min-w-fit">
                {sleepValid ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {sleepValid ? 'Valid' : '7h+ needed'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 7 hours sleep required for token reward
            </p>
          </div>

          {/* Reward Preview */}
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Potential Reward</span>
              </div>
              <Badge variant={allValid ? "default" : "secondary"} className="text-lg px-3 py-1">
                {allValid ? '10' : '0'} Ascend Tokens
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {allValid 
                ? 'All thresholds met! You will earn 10 Ascend tokens.' 
                : 'Meet all minimum thresholds to earn token rewards.'
              }
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full modern-button"
            disabled={submitHealthData.isPending || steps <= 0 || protein <= 0 || sleep <= 0}
          >
            {submitHealthData.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Submitting Proof...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Submit Health Data Proof
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProofOfLifeSubmission;
