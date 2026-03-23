import React, { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import WearableConnectionHub from '../components/WearableConnectionHub';
import { ArrowLeft, Download, Trash2, Shield, Bell, Palette, User, Watch, Database, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const Settings: React.FC = () => {
  const router = useRouter();
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    notifications: true,
    voiceEnabled: true,
    dataSharing: false,
    autoBackup: true,
    wearableSync: true,
    ocrProcessing: true,
    agentName: userProfile?.agentName || '',
  });

  const [isWearableHubOpen, setIsWearableHubOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleExportData = () => {
    // Enhanced mock data export including wearable and health records data
    const mockData = {
      profile: userProfile,
      exportDate: new Date().toISOString(),
      domains: ['fitness', 'nutrition', 'mental', 'finances', 'community', 'environment', 'purpose', 'longevity'],
      wearableData: {
        connectedDevices: ['Oura Ring', 'WHOOP Strap'],
        lastSync: new Date().toISOString(),
        dataPoints: 15420
      },
      healthRecords: {
        uploadedFiles: 3,
        extractedMetrics: 25,
        lastUpload: new Date().toISOString()
      },
      privacySettings: settings,
      note: 'Complete health data export including wearable integrations and uploaded health records'
    };
    
    const dataStr = JSON.stringify(mockData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ascend-health-complete-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Complete health data exported successfully');
  };

  const handleDeleteAccount = () => {
    // Mock account deletion with enhanced warning
    toast.error('Account deletion would remove all data including wearable connections and uploaded health records. This feature is not available in the demo version.');
  };

  const handleSaveAgentName = async () => {
    if (!userProfile || !settings.agentName.trim()) return;

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        agentName: settings.agentName.trim()
      });
      toast.success('Agent name updated successfully');
    } catch (error) {
      toast.error('Failed to update agent name');
    }
  };

  const navigate = (path: string) => {
    router.navigate({ to: path });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-xl text-muted-foreground">
            Customize your Ascend Health experience and manage integrations
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={userProfile?.name || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Name cannot be changed after account creation
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={userProfile?.age?.toString() || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agentName">AI Agent Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="agentName"
                    value={settings.agentName}
                    onChange={(e) => setSettings(prev => ({ ...prev, agentName: e.target.value }))}
                    placeholder="Enter agent name"
                  />
                  <Button 
                    onClick={handleSaveAgentName}
                    disabled={saveProfile.isPending || settings.agentName === userProfile?.agentName}
                  >
                    {saveProfile.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wearable & Data Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="w-5 h-5" />
                Wearable & Data Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Wearable Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data from connected wearable devices
                  </p>
                </div>
                <Switch
                  checked={settings.wearableSync}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, wearableSync: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>OCR Processing</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered data extraction from uploaded health records
                  </p>
                </div>
                <Switch
                  checked={settings.ocrProcessing}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, ocrProcessing: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Dialog open={isWearableHubOpen} onOpenChange={setIsWearableHubOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Watch className="w-4 h-4 mr-2" />
                      Manage Wearable Connections
                      <Badge variant="secondary" className="ml-auto">
                        2 Connected
                      </Badge>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Wearable Connection Hub</DialogTitle>
                    </DialogHeader>
                    <WearableConnectionHub />
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Health Data Sources
                  <Badge variant="secondary" className="ml-auto">
                    5 Sources
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for streaks and milestones
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Voice Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable text-to-speech for AI agent responses
                  </p>
                </div>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, voiceEnabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Anonymous Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymized data to improve the platform
                  </p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, dataSharing: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your data including wearable and health records
                  </p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoBackup: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Data Encryption & Security
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All wearable OAuth tokens are encrypted and stored securely</li>
                  <li>• Uploaded health records are processed with end-to-end encryption</li>
                  <li>• Data is stored on the Internet Computer for maximum security</li>
                  <li>• You maintain full control over data export and deletion</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Complete Health Data
                  <Badge variant="secondary" className="ml-auto">
                    Includes Wearables & Records
                  </Badge>
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account & All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
