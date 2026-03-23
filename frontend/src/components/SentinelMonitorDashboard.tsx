import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Database, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface SentinelHealthReport {
  id: string;
  domain: string;
  sentinelPrincipal: string;
  uptimePercentage: number;
  stateIntegrityStatus: boolean;
  dataDriftDetected: boolean;
  alertCount: number;
  reportTimestamp: bigint;
}

const SentinelMonitorDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data for all 8 domains
  const mockHealthReports: SentinelHealthReport[] = [
    {
      id: 'sentinel-fitness-001',
      domain: 'Fitness',
      sentinelPrincipal: 'sentinel-fitness',
      uptimePercentage: 99.8,
      stateIntegrityStatus: true,
      dataDriftDetected: false,
      alertCount: 0,
      reportTimestamp: BigInt(Date.now())
    },
    {
      id: 'sentinel-nutrition-002',
      domain: 'Nutrition',
      sentinelPrincipal: 'sentinel-nutrition',
      uptimePercentage: 99.5,
      stateIntegrityStatus: true,
      dataDriftDetected: false,
      alertCount: 1,
      reportTimestamp: BigInt(Date.now())
    },
    {
      id: 'sentinel-mental-003',
      domain: 'Mental',
      sentinelPrincipal: 'sentinel-mental',
      uptimePercentage: 98.9,
      stateIntegrityStatus: false,
      dataDriftDetected: true,
      alertCount: 3,
      reportTimestamp: BigInt(Date.now())
    },
    {
      id: 'sentinel-longevity-004',
      domain: 'Longevity',
      sentinelPrincipal: 'sentinel-longevity',
      uptimePercentage: 99.9,
      stateIntegrityStatus: true,
      dataDriftDetected: false,
      alertCount: 0,
      reportTimestamp: BigInt(Date.now())
    },
    {
      id: 'sentinel-finance-005',
      domain: 'Finance',
      sentinelPrincipal: 'sentinel-finance',
      uptimePercentage: 99.7,
      stateIntegrityStatus: true,
      dataDriftDetected: false,
      alertCount: 0,
      reportTimestamp: BigInt(Date.now())
    },
    {
      id: 'sentinel-purpose-006',
      domain: 'Purpose',
      sentinelPrincipal: 'sentinel-purpose',
      uptimePercentage: 99.6,
      stateIntegrityStatus: true,
      dataDriftDetected: false,
      alertCount: 1,
      reportTimestamp: BigInt(Date.now())
    },
    {
      id: 'sentinel-community-007',
      domain: 'Community',
      sentinelPrincipal: 'sentinel-community',
      uptimePercentage: 99.4,
      stateIntegrityStatus: true,
      dataDriftDetected: false,
      alertCount: 2,
      reportTimestamp: BigInt(Date.now())
    },
    {
      id: 'sentinel-environment-008',
      domain: 'Environment',
      sentinelPrincipal: 'sentinel-environment',
      uptimePercentage: 99.8,
      stateIntegrityStatus: true,
      dataDriftDetected: false,
      alertCount: 0,
      reportTimestamp: BigInt(Date.now())
    }
  ];

  const aggregatedStats = {
    totalReports: mockHealthReports.length,
    domainsMonitored: mockHealthReports.length,
    averageUptime: Math.round(mockHealthReports.reduce((sum, r) => sum + r.uptimePercentage, 0) / mockHealthReports.length * 10) / 10,
    totalAlerts: mockHealthReports.reduce((sum, r) => sum + r.alertCount, 0),
    stateIntegrityIssues: mockHealthReports.filter(r => !r.stateIntegrityStatus).length,
    dataDriftIssues: mockHealthReports.filter(r => r.dataDriftDetected).length
  };

  return (
    <div className="space-y-6">
      <Card className="modern-card border-green-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Sentinel Monitor Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Lightweight monitoring agents tracking uptime, state integrity, and data drift across all 8 health domains
              </p>
            </div>
            <Badge variant="default" className="bg-green-600">All Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Aggregated Statistics */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Domains</span>
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{aggregatedStats.domainsMonitored}</div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Avg Uptime</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{aggregatedStats.averageUptime}%</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Alerts</span>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{aggregatedStats.totalAlerts}</div>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">State Issues</span>
                <Shield className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{aggregatedStats.stateIntegrityIssues}</div>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Data Drift</span>
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{aggregatedStats.dataDriftIssues}</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Reports</span>
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{aggregatedStats.totalReports}</div>
            </div>
          </div>

          <Separator className="my-6" />

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="domain-reports">Domain Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">24-Hour Aggregated Reporting</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sentinel Monitors integrate directly with QA Partner Agent for comprehensive health reports every 24 hours across all domains.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold">Monitoring Capabilities</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Uptime Tracking</div>
                      <div className="text-xs text-muted-foreground">
                        Continuous monitoring of domain agent availability and responsiveness
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">State Integrity Validation</div>
                      <div className="text-xs text-muted-foreground">
                        Verifies consistency of domain agent state across operations
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Data Drift Detection</div>
                      <div className="text-xs text-muted-foreground">
                        Identifies unexpected changes in data patterns or distributions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Automated Alerting</div>
                      <div className="text-xs text-muted-foreground">
                        Real-time notifications for critical issues requiring attention
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="text-sm font-semibold">System Health Overview</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average Uptime</span>
                    <span className="font-medium">{aggregatedStats.averageUptime}%</span>
                  </div>
                  <Progress value={aggregatedStats.averageUptime} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">State Integrity</span>
                    <span className="font-medium">
                      {Math.round((1 - aggregatedStats.stateIntegrityIssues / aggregatedStats.domainsMonitored) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(1 - aggregatedStats.stateIntegrityIssues / aggregatedStats.domainsMonitored) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="domain-reports" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {mockHealthReports.map((report) => (
                  <div key={report.id} className={`p-4 rounded-lg border ${
                    report.stateIntegrityStatus && !report.dataDriftDetected
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className={`w-4 h-4 ${
                          report.stateIntegrityStatus && !report.dataDriftDetected
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }`} />
                        <span className="text-sm font-medium">{report.domain}</span>
                      </div>
                      <Badge variant={
                        report.stateIntegrityStatus && !report.dataDriftDetected
                          ? 'default'
                          : 'secondary'
                      }>
                        {report.stateIntegrityStatus && !report.dataDriftDetected ? 'Healthy' : 'Warning'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="font-medium text-green-600">{report.uptimePercentage}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">State Integrity:</span>
                        <span className={report.stateIntegrityStatus ? 'text-green-600' : 'text-red-600'}>
                          {report.stateIntegrityStatus ? 'Valid' : 'Issues Detected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Data Drift:</span>
                        <span className={report.dataDriftDetected ? 'text-orange-600' : 'text-green-600'}>
                          {report.dataDriftDetected ? 'Detected' : 'None'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Alerts:</span>
                        <span className={report.alertCount > 0 ? 'text-yellow-600' : 'text-green-600'}>
                          {report.alertCount}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="text-muted-foreground">
                        Last Report: {new Date(Number(report.reportTimestamp)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentinelMonitorDashboard;
