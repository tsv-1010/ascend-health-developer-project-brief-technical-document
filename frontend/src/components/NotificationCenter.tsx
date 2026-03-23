import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Smile, Zap, Heart } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificationPreference } from '../backend';
import { toast } from 'sonner';

const NotificationCenter: React.FC = () => {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [frequency, setFrequency] = useState('daily');
  const [tone, setTone] = useState('inspiring');
  const [enabledTypes, setEnabledTypes] = useState<string[]>(['streaks', 'milestones', 'recommendations']);

  const { data: preferences } = useQuery<NotificationPreference | null>({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNotificationPreferences();
    },
    enabled: !!actor,
  });

  const savePreferences = useMutation({
    mutationFn: async (prefs: NotificationPreference) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveNotificationPreferences(prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Notification preferences saved');
    },
  });

  const handleSave = async () => {
    if (!actor || !identity) return;

    const prefs: NotificationPreference = {
      userId: identity.getPrincipal(),
      frequency,
      tone,
      quietHours: preferences?.quietHours || [],
      enabledTypes,
      lastUpdated: BigInt(Date.now())
    };

    await savePreferences.mutateAsync(prefs);
  };

  const toggleNotificationType = (type: string) => {
    if (enabledTypes.includes(type)) {
      setEnabledTypes(enabledTypes.filter(t => t !== type));
    } else {
      setEnabledTypes([...enabledTypes, type]);
    }
  };

  const notificationTypes = [
    { id: 'streaks', label: 'Streak Reminders', description: 'Get notified about maintaining your health streaks' },
    { id: 'milestones', label: 'Milestone Achievements', description: 'Celebrate when you reach important goals' },
    { id: 'recommendations', label: 'AI Recommendations', description: 'Receive personalized health suggestions' },
    { id: 'protocols', label: 'Protocol Updates', description: 'Track progress on your health protocols' },
  ];

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Center
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize your notification preferences and timing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="minimal">Minimal (Important Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Notification Tone
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gentle">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Gentle & Supportive
                  </div>
                </SelectItem>
                <SelectItem value="inspiring">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Inspiring & Motivational
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Urgent & Direct
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how your notifications communicate with you
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Notification Types</Label>
          {notificationTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </div>
              <Switch
                checked={enabledTypes.includes(type.id)}
                onCheckedChange={() => toggleNotificationType(type.id)}
              />
            </div>
          ))}
        </div>

        <div className="p-4 bg-muted/30 rounded-xl">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Smart Timing
          </h4>
          <p className="text-sm text-muted-foreground">
            Notifications are automatically scheduled based on your activity patterns and quiet hours to avoid disruption.
          </p>
        </div>

        <Button onClick={handleSave} disabled={savePreferences.isPending} className="w-full">
          {savePreferences.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
