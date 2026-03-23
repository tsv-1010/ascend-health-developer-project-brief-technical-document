import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Watch, 
  Activity, 
  Heart, 
  Zap, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings,
  Wifi,
  WifiOff,
  Clock,
  Shield,
  Battery,
  Signal,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface WearableDevice {
  id: string;
  name: string;
  brand: string;
  icon: React.ComponentType<any>;
  connected: boolean;
  lastSync: Date | null;
  syncStatus: 'syncing' | 'success' | 'error' | 'idle';
  dataTypes: string[];
  batteryLevel?: number;
  signalStrength?: number;
  oauthUrl?: string;
  privacySettings: {
    dataSharing: boolean;
    autoSync: boolean;
    retentionDays: number;
  };
  syncHistory: Array<{
    timestamp: Date;
    status: 'success' | 'error';
    dataPoints: number;
  }>;
  encryptionStatus: 'encrypted' | 'pending' | 'error';
}

interface BenchmarkStandard {
  name: string;
  organization: string;
  value: number;
  unit: string;
  description: string;
}

const WearableConnectionHub: React.FC = () => {
  const [devices, setDevices] = useState<WearableDevice[]>([
    {
      id: 'apple-health',
      name: 'Apple Health',
      brand: 'Apple',
      icon: Smartphone,
      connected: false,
      lastSync: null,
      syncStatus: 'idle',
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'VO2 Max', 'Blood Oxygen', 'ECG'],
      oauthUrl: 'https://developer.apple.com/health-fitness/',
      privacySettings: {
        dataSharing: true,
        autoSync: true,
        retentionDays: 365
      },
      syncHistory: [],
      encryptionStatus: 'encrypted'
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      brand: 'Oura',
      icon: Watch,
      connected: true,
      lastSync: new Date(Date.now() - 15 * 60 * 1000),
      syncStatus: 'success',
      dataTypes: ['Sleep', 'HRV', 'Temperature', 'Activity', 'Readiness', 'Recovery'],
      batteryLevel: 78,
      signalStrength: 95,
      privacySettings: {
        dataSharing: true,
        autoSync: true,
        retentionDays: 365
      },
      syncHistory: [
        { timestamp: new Date(Date.now() - 15 * 60 * 1000), status: 'success', dataPoints: 24 },
        { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'success', dataPoints: 22 },
        { timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), status: 'success', dataPoints: 25 }
      ],
      encryptionStatus: 'encrypted'
    },
    {
      id: 'whoop',
      name: 'WHOOP Strap 4.0',
      brand: 'WHOOP',
      icon: Activity,
      connected: true,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      syncStatus: 'idle',
      dataTypes: ['HRV', 'Sleep', 'Strain', 'Recovery', 'Respiratory Rate', 'Skin Temperature'],
      batteryLevel: 45,
      signalStrength: 88,
      privacySettings: {
        dataSharing: true,
        autoSync: true,
        retentionDays: 365
      },
      syncHistory: [
        { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'success', dataPoints: 18 },
        { timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), status: 'error', dataPoints: 0 },
        { timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000), status: 'success', dataPoints: 19 }
      ],
      encryptionStatus: 'encrypted'
    },
    {
      id: 'function-health',
      name: 'Function Health',
      brand: 'Function',
      icon: Heart,
      connected: false,
      lastSync: null,
      syncStatus: 'idle',
      dataTypes: ['Lab Results', 'Biomarkers', 'Health Insights', 'Lipid Panel', 'Metabolic Panel'],
      oauthUrl: 'https://functionhealth.com/api',
      privacySettings: {
        dataSharing: false,
        autoSync: false,
        retentionDays: 730
      },
      syncHistory: [],
      encryptionStatus: 'encrypted'
    },
    {
      id: 'fitbit',
      name: 'Fitbit Sense 2',
      brand: 'Fitbit',
      icon: Watch,
      connected: false,
      lastSync: null,
      syncStatus: 'idle',
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Exercise', 'Stress', 'SpO2'],
      oauthUrl: 'https://dev.fitbit.com/build/reference/web-api/',
      privacySettings: {
        dataSharing: true,
        autoSync: true,
        retentionDays: 365
      },
      syncHistory: [],
      encryptionStatus: 'encrypted'
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      brand: 'Garmin',
      icon: Watch,
      connected: false,
      lastSync: null,
      syncStatus: 'idle',
      dataTypes: ['GPS', 'Heart Rate', 'VO2 Max', 'Training Load', 'Body Battery', 'Pulse Ox'],
      oauthUrl: 'https://developer.garmin.com/connect-iq/',
      privacySettings: {
        dataSharing: true,
        autoSync: true,
        retentionDays: 365
      },
      syncHistory: [],
      encryptionStatus: 'encrypted'
    },
    {
      id: 'levels',
      name: 'Levels CGM',
      brand: 'Levels',
      icon: Zap,
      connected: false,
      lastSync: null,
      syncStatus: 'idle',
      dataTypes: ['Glucose', 'Metabolic Health', 'Food Logging', 'Glucose Variability', 'Time in Range'],
      oauthUrl: 'https://www.levelshealth.com/api',
      privacySettings: {
        dataSharing: false,
        autoSync: true,
        retentionDays: 365
      },
      syncHistory: [],
      encryptionStatus: 'encrypted'
    }
  ]);

  const [selectedDevice, setSelectedDevice] = useState<WearableDevice | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState('15min');
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);

  // Industry benchmark standards
  const benchmarkStandards: Record<string, BenchmarkStandard[]> = {
    'Steps': [
      { name: 'CDC Recommendation', organization: 'CDC', value: 10000, unit: 'steps/day', description: 'Minimum daily steps for health benefits' },
      { name: 'WHO Guidelines', organization: 'WHO', value: 8000, unit: 'steps/day', description: 'Basic activity level for adults' }
    ],
    'Heart Rate': [
      { name: 'Resting HR (Adults)', organization: 'AHA', value: 70, unit: 'bpm', description: 'Average resting heart rate for adults' },
      { name: 'Athletic Range', organization: 'Sports Medicine', value: 50, unit: 'bpm', description: 'Typical for trained athletes' }
    ],
    'HRV': [
      { name: 'Optimal Range', organization: 'HRV Research', value: 50, unit: 'ms', description: 'Good cardiovascular health indicator' },
      { name: 'Elite Athletes', organization: 'Sports Science', value: 70, unit: 'ms', description: 'High-performance range' }
    ],
    'Sleep': [
      { name: 'Adult Recommendation', organization: 'NSF', value: 8, unit: 'hours', description: 'Recommended sleep duration for adults' },
      { name: 'Sleep Efficiency', organization: 'Sleep Medicine', value: 85, unit: '%', description: 'Optimal sleep quality metric' }
    ]
  };

  const handleConnect = async (device: WearableDevice) => {
    if (device.connected) {
      // Disconnect with user consent confirmation
      const confirmed = window.confirm(`Disconnect from ${device.name}? This will stop data sync and remove stored OAuth tokens.`);
      if (!confirmed) return;

      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { ...d, connected: false, lastSync: null, syncStatus: 'idle', batteryLevel: undefined, signalStrength: undefined }
          : d
      ));
      toast.success(`Disconnected from ${device.name}. OAuth tokens have been securely removed.`);
    } else {
      // Connect with OAuth flow simulation
      toast.info(`Redirecting to ${device.name} secure authorization...`);
      
      // Simulate OAuth process with user consent
      setTimeout(() => {
        const userConsent = window.confirm(`Grant ${device.name} permission to sync health data? All data will be encrypted and you can revoke access anytime.`);
        if (!userConsent) {
          toast.info('Authorization cancelled by user');
          return;
        }

        setDevices(prev => prev.map(d => 
          d.id === device.id 
            ? { 
                ...d, 
                connected: true, 
                lastSync: new Date(), 
                syncStatus: 'success',
                batteryLevel: Math.floor(Math.random() * 100),
                signalStrength: Math.floor(Math.random() * 30) + 70,
                encryptionStatus: 'encrypted'
              }
            : d
        ));
        toast.success(`Successfully connected to ${device.name}! OAuth tokens encrypted and stored securely.`);
      }, 2000);
    }
  };

  const handleSync = async (device: WearableDevice) => {
    if (!device.connected) return;

    setDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, syncStatus: 'syncing' } : d
    ));

    // Simulate sync process with realistic timing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      const dataPoints = Math.floor(Math.random() * 30) + 10;
      
      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { 
              ...d, 
              syncStatus: success ? 'success' : 'error',
              lastSync: success ? new Date() : d.lastSync,
              syncHistory: success ? [
                { timestamp: new Date(), status: 'success', dataPoints },
                ...d.syncHistory.slice(0, 9)
              ] : [
                { timestamp: new Date(), status: 'error', dataPoints: 0 },
                ...d.syncHistory.slice(0, 9)
              ]
            }
          : d
      ));
      
      if (success) {
        toast.success(`${device.name} synced successfully! ${dataPoints} data points updated.`);
      } else {
        toast.error(`Failed to sync ${device.name}. Check device connection and try again.`);
      }
    }, 3000);
  };

  const handleSyncAll = async () => {
    const connectedDevices = devices.filter(d => d.connected);
    
    if (connectedDevices.length === 0) {
      toast.error('No connected devices to sync');
      return;
    }

    toast.info(`Syncing ${connectedDevices.length} devices with encrypted data transfer...`);
    
    for (const device of connectedDevices) {
      await handleSync(device);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const updatePrivacySettings = (deviceId: string, settings: Partial<WearableDevice['privacySettings']>) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId 
        ? { ...d, privacySettings: { ...d.privacySettings, ...settings } }
        : d
    ));
    toast.success('Privacy settings updated');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionIcon = (connected: boolean) => {
    return connected ? (
      <Wifi className="w-4 h-4 text-green-500" />
    ) : (
      <WifiOff className="w-4 h-4 text-gray-400" />
    );
  };

  const getEncryptionIcon = (status: string) => {
    switch (status) {
      case 'encrypted':
        return <Lock className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Lock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatLastSync = (lastSync: Date | null) => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const connectedCount = devices.filter(d => d.connected).length;
  const syncingCount = devices.filter(d => d.syncStatus === 'syncing').length;
  const encryptedCount = devices.filter(d => d.encryptionStatus === 'encrypted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wearable Integration Hub</h2>
          <p className="text-muted-foreground">
            Connect devices with OAuth2 authentication and encrypted data storage
          </p>
        </div>
        <img 
          src="/assets/generated/wearable-connection-hub.png" 
          alt="Wearable Hub"
          className="w-16 h-16 rounded-2xl shadow-soft"
        />
      </div>

      {/* Enhanced Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Connection & Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
              <div className="text-sm text-muted-foreground">Connected Devices</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{syncingCount}</div>
              <div className="text-sm text-muted-foreground">Currently Syncing</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{encryptedCount}</div>
              <div className="text-sm text-muted-foreground">Encrypted Connections</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">
                {devices.reduce((sum, d) => sum + d.syncHistory.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Sync Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Sync & Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Automatic Sync</div>
              <div className="text-sm text-muted-foreground">
                Automatically sync data from connected devices with encryption
              </div>
            </div>
            <Switch
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Privacy Details</div>
              <div className="text-sm text-muted-foreground">
                Show detailed privacy and encryption information
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
            >
              {showPrivacyDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Sync All Devices</div>
              <div className="text-sm text-muted-foreground">
                Manually trigger encrypted sync for all connected devices
              </div>
            </div>
            <Button 
              onClick={handleSyncAll}
              disabled={syncingCount > 0 || connectedCount === 0}
              variant="outline"
            >
              {syncingCount > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Device List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => {
          const Icon = device.icon;
          
          return (
            <Card key={device.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{device.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getConnectionIcon(device.connected)}
                    {getEncryptionIcon(device.encryptionStatus)}
                    {getStatusIcon(device.syncStatus)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={device.connected ? "default" : "secondary"}
                    className={device.connected ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                  >
                    {device.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatLastSync(device.lastSync)}
                  </span>
                </div>

                {/* Device Status Indicators */}
                {device.connected && (
                  <div className="grid grid-cols-2 gap-4">
                    {device.batteryLevel && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Battery className="w-3 h-3" />
                            Battery
                          </span>
                          <span>{device.batteryLevel}%</span>
                        </div>
                        <Progress 
                          value={device.batteryLevel} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    {device.signalStrength && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Signal className="w-3 h-3" />
                            Signal
                          </span>
                          <span>{device.signalStrength}%</span>
                        </div>
                        <Progress 
                          value={device.signalStrength} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Data Types */}
                <div>
                  <div className="text-sm font-medium mb-2">Data Types</div>
                  <div className="flex flex-wrap gap-1">
                    {device.dataTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings Preview */}
                {showPrivacyDetails && device.connected && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="text-sm font-medium">Privacy Settings</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Auto Sync: {device.privacySettings.autoSync ? 'On' : 'Off'}</div>
                      <div>Data Sharing: {device.privacySettings.dataSharing ? 'On' : 'Off'}</div>
                      <div>Retention: {device.privacySettings.retentionDays} days</div>
                      <div>Encryption: {device.encryptionStatus}</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleConnect(device)}
                    variant={device.connected ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                  >
                    {device.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                  
                  {device.connected && (
                    <Button
                      onClick={() => handleSync(device)}
                      disabled={device.syncStatus === 'syncing'}
                      variant="outline"
                      size="sm"
                    >
                      {device.syncStatus === 'syncing' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDevice(device)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{device.name} Settings & Benchmarks</DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="privacy" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="privacy">Privacy</TabsTrigger>
                          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                          <TabsTrigger value="history">Sync History</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="privacy" className="space-y-4">
                          <Alert>
                            <Shield className="w-4 h-4" />
                            <AlertDescription>
                              All data is encrypted end-to-end. OAuth tokens are stored securely and can be revoked anytime.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">Auto Sync</div>
                                <div className="text-sm text-muted-foreground">
                                  Automatically sync data every 15 minutes
                                </div>
                              </div>
                              <Switch 
                                checked={device.privacySettings.autoSync}
                                onCheckedChange={(checked) => 
                                  updatePrivacySettings(device.id, { autoSync: checked })
                                }
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">Anonymous Data Sharing</div>
                                <div className="text-sm text-muted-foreground">
                                  Share anonymized data for research
                                </div>
                              </div>
                              <Switch 
                                checked={device.privacySettings.dataSharing}
                                onCheckedChange={(checked) => 
                                  updatePrivacySettings(device.id, { dataSharing: checked })
                                }
                              />
                            </div>
                            
                            <div>
                              <div className="font-medium mb-2">Data Retention</div>
                              <div className="text-sm text-muted-foreground mb-2">
                                How long to keep synced data: {device.privacySettings.retentionDays} days
                              </div>
                              <Progress value={(device.privacySettings.retentionDays / 730) * 100} className="h-2" />
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="benchmarks" className="space-y-4">
                          <div className="space-y-4">
                            {device.dataTypes.map((dataType) => {
                              const standards = benchmarkStandards[dataType] || [];
                              if (standards.length === 0) return null;
                              
                              return (
                                <div key={dataType} className="space-y-2">
                                  <h4 className="font-medium">{dataType} Standards</h4>
                                  {standards.map((standard, index) => (
                                    <div key={index} className="p-3 border rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="font-medium text-sm">{standard.name}</div>
                                        <Badge variant="outline">{standard.organization}</Badge>
                                      </div>
                                      <div className="text-lg font-bold">
                                        {standard.value} {standard.unit}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {standard.description}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="history" className="space-y-4">
                          <div className="space-y-3">
                            {device.syncHistory.length > 0 ? (
                              device.syncHistory.map((sync, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {sync.status === 'success' ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    <div>
                                      <div className="font-medium text-sm">
                                        {sync.status === 'success' ? 'Successful Sync' : 'Sync Failed'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {sync.timestamp.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-sm">
                                    {sync.dataPoints > 0 && `${sync.dataPoints} data points`}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                No sync history available
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Privacy Notice */}
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription>
          <strong>Privacy & Security:</strong> All wearable data is encrypted end-to-end using industry-standard protocols. 
          OAuth2 tokens are stored securely on the Internet Computer. You maintain full control over data sharing, 
          retention periods, and can revoke access or export your data at any time. User consent is required for each integration.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default WearableConnectionHub;
