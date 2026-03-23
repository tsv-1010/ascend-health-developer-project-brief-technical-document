import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Activity, 
  Coins, 
  Upload, 
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useWearableSync, useLLMQuery } from '../hooks/useQueries';

interface QuickActionsMenuProps {
  onClose?: () => void;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wearableSync = useWearableSync();
  const llmQuery = useLLMQuery();

  const quickActions = [
    {
      id: 'sync-all',
      label: 'Sync All Devices',
      icon: RefreshCw,
      color: 'from-blue-500 to-cyan-500',
      action: async () => {
        toast.loading('Syncing all wearables...', { id: 'sync-all' });
        try {
          await wearableSync.mutateAsync('all-devices');
          toast.success('All devices synced successfully!', { id: 'sync-all' });
        } catch (error) {
          toast.error('Failed to sync devices', { id: 'sync-all' });
        }
        setIsOpen(false);
      }
    },
    {
      id: 'claim-rewards',
      label: 'Claim Rewards',
      icon: Coins,
      color: 'from-yellow-500 to-orange-500',
      action: () => {
        toast.success('Rewards claimed! +25 Ascend tokens');
        setIsOpen(false);
      }
    },
    {
      id: 'ai-summary',
      label: 'Ask AI for Summary',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      action: async () => {
        toast.loading('Generating AI summary...', { id: 'ai-summary' });
        try {
          const result = await llmQuery.mutateAsync({
            prompt: 'Give me a quick summary of my health status today',
            context: 'dashboard'
          });
          toast.success('AI summary ready! Check the chat.', { id: 'ai-summary' });
        } catch (error) {
          toast.error('Failed to generate summary', { id: 'ai-summary' });
        }
        setIsOpen(false);
      }
    },
    {
      id: 'upload-labs',
      label: 'Upload Labs',
      icon: Upload,
      color: 'from-green-500 to-emerald-500',
      action: () => {
        toast.info('Navigate to Health Labs to upload');
        setIsOpen(false);
      }
    },
    {
      id: 'emergency-sync',
      label: 'Emergency Sync',
      icon: Activity,
      color: 'from-red-500 to-pink-500',
      action: async () => {
        toast.loading('Emergency sync in progress...', { id: 'emergency' });
        try {
          await wearableSync.mutateAsync('emergency-sync');
          toast.success('Emergency sync completed!', { id: 'emergency' });
        } catch (error) {
          toast.error('Emergency sync failed', { id: 'emergency' });
        }
        setIsOpen(false);
      }
    }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      onClose?.();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Actions Menu */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-72 modern-card animate-scale-in shadow-2xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-semibold">Quick Actions</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 hover:scale-105 transition-transform"
                  onClick={action.action}
                  disabled={wearableSync.isPending || llmQuery.isPending}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} mr-3`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Button>
              );
            })}
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                One-tap access to common tasks
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <Button
        size="lg"
        className={`w-16 h-16 rounded-full shadow-2xl modern-button transition-all duration-300 ${
          isOpen ? 'rotate-45' : ''
        }`}
        onClick={handleToggle}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Zap className="w-6 h-6" />
        )}
      </Button>
      
      {/* Badge for pending actions */}
      {!isOpen && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -left-2 w-6 h-6 text-xs p-0 flex items-center justify-center rounded-full animate-pulse"
        >
          3
        </Badge>
      )}
    </div>
  );
};

export default QuickActionsMenu;
