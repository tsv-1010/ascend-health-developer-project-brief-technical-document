import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center space-y-6">
          <img 
            src="/assets/generated/ascend-health-logo.png" 
            alt="Ascend Health Logo" 
            className="w-24 h-24 mx-auto rounded-full shadow-lg animate-pulse"
          />
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Ascend Health
            </h2>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading your wellness journey...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingScreen;
