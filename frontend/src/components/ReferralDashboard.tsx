import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllReferrals, useClaimReferralReward } from '../hooks/useQueries';
import { 
  Users, 
  Copy, 
  Share2, 
  Gift, 
  TrendingUp, 
  Coins, 
  Mail, 
  CheckCircle,
  Clock,
  UserPlus,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const ReferralDashboard: React.FC = () => {
  const { data: referrals = [] } = useGetAllReferrals();
  const claimReferralReward = useClaimReferralReward();
  const [userReferralCode] = useState(`REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Mock referral data for demonstration
  const mockReferralStats = {
    totalReferrals: 3,
    successfulReferrals: 2,
    pendingReferrals: 1,
    totalEarned: 200, // 2 successful * 100 tokens each
    pendingRewards: 100 // 1 pending * 100 tokens
  };

  const mockReferralHistory = [
    {
      id: '1',
      email: 'sarah@example.com',
      status: 'completed',
      joinedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rewardEarned: 100,
      friendDiscount: 10
    },
    {
      id: '2',
      email: 'mike@example.com',
      status: 'completed',
      joinedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      rewardEarned: 100,
      friendDiscount: 10
    },
    {
      id: '3',
      email: 'alex@example.com',
      status: 'pending',
      invitedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      rewardEarned: 0,
      friendDiscount: 0
    }
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferralCode = () => {
    const shareText = `Join me on Ascend Health for personalized wellness tracking! Use my referral code ${userReferralCode} to get 50 Ascend tokens + 10% shop discount. Sign up at ascendhealth.app`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Ascend Health',
        text: shareText,
        url: `https://ascendhealth.app?ref=${userReferralCode}`
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Referral message copied to clipboard!');
    }
  };

  const handleClaimReward = async (referralId: string) => {
    try {
      await claimReferralReward.mutateAsync(userReferralCode);
      toast.success('Referral reward claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim referral reward');
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Referral Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{mockReferralStats.totalReferrals}</div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{mockReferralStats.successfulReferrals}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
            <div className="text-2xl font-bold text-yellow-600">{mockReferralStats.totalEarned}</div>
            <div className="text-sm text-muted-foreground">Tokens Earned</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">{mockReferralStats.pendingRewards}</div>
            <div className="text-sm text-muted-foreground">Pending Rewards</div>
          </div>
        </div>

        <Separator />

        {/* Referral Code Sharing */}
        <div className="space-y-4">
          <div>
            <Label className="text-lg font-semibold">Your Referral Code</Label>
            <p className="text-sm text-muted-foreground">
              Share this code with friends to earn 100 Ascend tokens per successful referral
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={userReferralCode}
              readOnly
              className="font-mono text-lg"
            />
            <Button variant="outline" onClick={copyReferralCode}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={shareReferralCode}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Alert>
            <Gift className="w-4 h-4" />
            <AlertDescription>
              <strong>Referral Benefits:</strong> You earn 100 Ascend tokens for each friend who joins and completes onboarding. 
              Your friends get 50 tokens + 10% discount on all Health Shop purchases!
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* Referral History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Referral History</h3>
            <Badge variant="outline">
              {mockReferralHistory.length} invitations sent
            </Badge>
          </div>
          
          <div className="space-y-3">
            {mockReferralHistory.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{referral.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {referral.status === 'completed' 
                        ? `Joined ${referral.joinedDate?.toLocaleDateString()}`
                        : `Invited ${referral.invitedDate?.toLocaleDateString()}`
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-600" />
                      <span className="text-sm font-medium">
                        {referral.rewardEarned} tokens
                      </span>
                    </div>
                    {referral.friendDiscount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Friend got {referral.friendDiscount}% discount
                      </div>
                    )}
                  </div>
                  
                  <Badge 
                    variant={referral.status === 'completed' ? 'default' : 'secondary'}
                    className={referral.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }
                  >
                    {referral.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Invite More Friends</h4>
              <p className="text-sm text-muted-foreground">
                Share your referral code on social media or send direct invitations
              </p>
            </div>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Social Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralDashboard;
