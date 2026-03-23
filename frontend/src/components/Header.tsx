import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetNotifications } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Bell, Settings, LogOut, User, Shield, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: notifications = [] } = useGetNotifications();
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
    toast.success('Logged out successfully');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <img 
              src="/assets/generated/ascend-health-logo.png" 
              alt="Ascend Health" 
              className="w-10 h-10 rounded-2xl shadow-soft"
            />
            <div>
              <h1 className="text-xl font-black gradient-text">Ascend Health</h1>
              <p className="text-xs text-muted-foreground">Proof of Vitality</p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* User Greeting */}
            {userProfile && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">Hello, {userProfile.name}! 👋</p>
                <p className="text-xs text-muted-foreground">
                  {identity?.getPrincipal().toString().substring(0, 8)}...
                </p>
              </div>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-semibold">Notifications</div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                      <div className="font-medium">{notification.type}</div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/sprint' })}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sprint Features
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/whitepaper' })}>
                  <FileText className="w-4 h-4 mr-2" />
                  White Paper
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
