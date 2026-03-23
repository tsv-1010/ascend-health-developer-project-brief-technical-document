import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from '@tanstack/react-router';
import { ArrowLeft, Shield, Activity, Users, Database, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import TransparencyDashboard from '../components/TransparencyDashboard';
import PerformanceMonitoring from '../components/PerformanceMonitoring';
import CommunityPortal from '../components/CommunityPortal';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('performance');

  const navigate = (path: string) => {
    router.navigate({ to: path });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-xl text-muted-foreground">
                System monitoring, governance, and analytics
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Admin Access
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1">
            <TabsTrigger value="performance" className="rounded-xl font-medium">
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="transparency" className="rounded-xl font-medium">
              <Shield className="w-4 h-4 mr-2" />
              Transparency
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-xl font-medium">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl font-medium">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <PerformanceMonitoring />
          </TabsContent>

          <TabsContent value="transparency" className="space-y-6 mt-6">
            <TransparencyDashboard />
          </TabsContent>

          <TabsContent value="community" className="space-y-6 mt-6">
            <CommunityPortal />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Anonymous Analytics Aggregates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Daily Active Users</div>
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-xs text-green-600 mt-1">+12% vs yesterday</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Proof Submissions</div>
                    <div className="text-2xl font-bold">3,892</div>
                    <div className="text-xs text-green-600 mt-1">+8% vs last week</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">AI Insights Used</div>
                    <div className="text-2xl font-bold">5,621</div>
                    <div className="text-xs text-green-600 mt-1">+15% vs last week</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Privacy Notice</h4>
                  <p className="text-sm text-muted-foreground">
                    All analytics are aggregated and anonymized. No individual user data is stored or displayed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
