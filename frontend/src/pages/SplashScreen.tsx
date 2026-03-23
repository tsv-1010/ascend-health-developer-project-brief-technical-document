import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SplashScreen: React.FC = () => {
  const { login, loginStatus } = useInternetIdentity();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const welcomeMessage = "Welcome to Ascend Health, your personal wellness companion. Ready to begin your journey to optimal health and wellbeing?";

  useEffect(() => {
    // Use browser's built-in Text-to-Speech API for voice introduction
    if (speechEnabled && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(welcomeMessage);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeechError('Voice synthesis not available');
        };
        
        setTimeout(() => {
          speechSynthesis.speak(utterance);
        }, 1000);
      } catch (error) {
        setSpeechError('Voice synthesis not supported');
      }
    }
  }, [speechEnabled]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSpeechEnabled(!speechEnabled);
    setSpeechError(null);
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      // Error handling is managed by the useInternetIdentity hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center space-y-8">
          <div className="space-y-6">
            <img 
              src="/assets/generated/ascend-health-logo.png" 
              alt="Ascend Health Logo" 
              className="w-32 h-32 mx-auto rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Ascend Health
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your AI-powered wellness companion for a healthier, happier life
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSpeech}
              className="absolute top-2 right-2"
              title={speechEnabled ? "Disable voice" : "Enable voice"}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <p className="text-lg text-foreground/90 leading-relaxed">
              {welcomeMessage}
            </p>
            {isSpeaking && (
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            {speechError && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {speechError}. Voice features require a modern browser.
                  {/* Future integration point: Enhanced TTS/STT with WebRTC or external APIs could be added here */}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              size="lg"
              className="w-full text-xl py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
            >
              {loginStatus === 'logging-in' ? 'Connecting...' : 'Begin Your Journey'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Secure login powered by Internet Identity
              {/* Future integration point: OAuth providers (Google, Apple, etc.) could be integrated here */}
            </p>
          </div>

          {/* Privacy-first messaging for unsupported features */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>🔒 Your data stays private and secure on the Internet Computer</p>
            <p>🌐 No third-party tracking or data sharing</p>
            {/* Future integration point: ZKP-based privacy features could be highlighted here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SplashScreen;
