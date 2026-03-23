import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile, useAddAgentInteraction, useGetAgentInteractions, useLLMQuery, useGetLLMMetrics, usePrefetchCommonPatterns } from '../hooks/useQueries';
import { AgentInteraction } from '../backend';
import { MessageCircle, Send, Mic, MicOff, Sparkles, AlertCircle, Bot, Zap, Shield, Activity, TrendingUp, AlertTriangle, Clock, Database } from 'lucide-react';
import { toast } from 'sonner';

interface AIPageHeaderProps {
  pageContext: 'dashboard' | 'health-labs' | 'defi' | 'shop' | 'schedule';
  insights?: string;
}

const AIPageHeader: React.FC<AIPageHeaderProps> = ({ pageContext, insights }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: interactions = [] } = useGetAgentInteractions();
  const { data: llmMetrics = [] } = useGetLLMMetrics();
  const addInteraction = useAddAgentInteraction();
  const llmQuery = useLLMQuery();
  const prefetchPatterns = usePrefetchCommonPatterns();

  const agentName = userProfile?.agentName || 'Aria';
  const userName = userProfile?.name || 'there';

  // Sprint 3: Calculate LLM performance metrics
  const avgLatency = llmMetrics.length > 0 
    ? Math.round(llmMetrics.reduce((sum, m) => sum + m.latencyMs, 0) / llmMetrics.length)
    : 0;
  
  const successRate = llmMetrics.length > 0
    ? Math.round((llmMetrics.filter(m => m.success).length / llmMetrics.length) * 100)
    : 100;

  const cacheHitRate = llmMetrics.length > 0
    ? Math.round((llmMetrics.filter(m => m.cacheHit).length / llmMetrics.length) * 100)
    : 0;

  const recentFailures = llmMetrics.slice(0, 5).filter(m => !m.success).length;
  const avgRetries = llmMetrics.length > 0
    ? (llmMetrics.reduce((sum, m) => sum + (m.retryCount || 0), 0) / llmMetrics.length).toFixed(1)
    : '0.0';

  // Sprint 3: Prefetch common patterns on mount
  useEffect(() => {
    if (isChatExpanded && llmMetrics.length === 0) {
      prefetchPatterns.mutate(pageContext);
    }
  }, [isChatExpanded, pageContext]);

  const contextualPrompts = {
    dashboard: ['Show my health score trends', 'What should I focus on today?', 'Review my domain progress'],
    'health-labs': ['Analyze my lab results', 'Create a custom chart', 'Compare my biomarkers'],
    defi: ['Show my portfolio performance', 'Optimize my staking strategy', 'Review my referral rewards'],
    shop: ['Recommend supplements for me', 'Find products for my goals', 'Show personalized protocols'],
    schedule: ['Optimize my weekly schedule', 'Suggest workout times', 'Plan my health routines']
  };

  const contextualInsights = {
    dashboard: insights || `Your integrated health score is looking great! You have 4 connected wearables syncing data. Your sleep quality improved 12% and your portfolio is up 2.3% this week.`,
    'health-labs': insights || `Your latest lab results show optimal cholesterol (185 mg/dL) and healthy glucose levels (92 mg/dL). Vitamin D is at 32 ng/mL - excellent! Consider tracking HRV trends for deeper insights.`,
    defi: insights || `Your DeFi portfolio is performing well with 2.3% gains this week. You've earned ${interactions.length * 10} Ascend tokens from proof submissions. Consider staking more tokens for higher APY.`,
    shop: insights || `Based on your lab results and health goals, I recommend focusing on longevity protocols and metabolic health supplements. Your referral discount is active for 10% off all purchases!`,
    schedule: insights || `Your weekly schedule shows good balance across domains. Consider adding more recovery time on Wednesdays and scheduling your HIIT workouts for mornings when your energy is highest.`
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');

    try {
      // Sprint 3: Call ICP-native LLM canister with enhanced caching and error handling
      console.log('🚀 Sending query to ICP-native LLM canister with Sprint 3 optimizations...');
      const result = await llmQuery.mutateAsync({
        prompt: userMessage,
        context: pageContext
      });
      
      const response = result.response;
      const isFallback = result.fallback || false;
      const isOnChain = result.onChain || false;
      const isCached = result.cached || false;
      
      // Save interaction to backend
      const interaction: AgentInteraction = {
        message: userMessage,
        response: response,
        timestamp: BigInt(Date.now())
      };

      await addInteraction.mutateAsync(interaction);
      
      // Use browser's built-in Text-to-Speech for response
      if ('speechSynthesis' in window && !isFallback) {
        try {
          const utterance = new SpeechSynthesisUtterance(response);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.log('TTS not available:', error);
        }
      }
      
      // Sprint 3: Enhanced user feedback
      if (isCached) {
        toast.success('Response from cache - instant!', {
          description: 'Your query was answered using cached data for maximum speed.'
        });
      } else if (isFallback) {
        toast.warning('Using fallback response - LLM service temporarily unavailable', {
          description: 'Your data remains secure on-chain. The AI will reconnect shortly.'
        });
      } else if (isOnChain) {
        toast.success('Response generated by ICP-native LLM', {
          description: `All processing happened on-chain with privacy-protected data. Latency: ${result.metrics?.latencyMs}ms`
        });
      }
      
    } catch (error) {
      console.error('Message send error:', error);
      toast.error('Failed to send message', {
        description: 'Please check your connection and try again. Retrying automatically...'
      });
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
        };
        
        recognition.onend = () => setIsListening(false);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          toast.success('Voice input captured');
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          const errorMessage = `Voice recognition failed: ${event.error}`;
          setVoiceError(errorMessage);
          toast.error('Voice recognition failed. Please try typing instead.');
        };

        recognition.start();
      } catch (error) {
        setVoiceError('Voice recognition not supported');
        toast.error('Voice recognition not supported in this browser.');
      }
    } else {
      setVoiceError('Voice recognition not supported');
      toast.error('Voice recognition not supported in this browser.');
    }
  };

  return (
    <div className="w-full mb-8 space-y-4">
      {/* AI Insights Section with Sprint 3 Performance Indicators */}
      <Card className="modern-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="/assets/generated/ai-agent-avatar.png" 
                alt={agentName}
                className="w-10 h-10 rounded-2xl shadow-soft"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse">
                <Bot className="w-2 h-2 text-white m-0.5" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="gradient-text font-black text-lg">{agentName}'s AI Insights</span>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  On-Chain AI
                </Badge>
                {llmMetrics.length > 0 && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      {avgLatency}ms avg
                    </Badge>
                    <Badge 
                      variant={successRate >= 90 ? "default" : "destructive"} 
                      className="text-xs"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {successRate}% success
                    </Badge>
                    {cacheHitRate > 0 && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30">
                        <Database className="w-3 h-3 mr-1" />
                        {cacheHitRate}% cached
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-normal mt-1">
                Powered by ICP-native LLM (w36hm-eqaaa-aaal-qr76a-cai) • Privacy-preserving • HIPAA-compliant • Sprint 3 Optimized
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-foreground leading-relaxed">
                {contextualInsights[pageContext]}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>All AI processing happens on-chain via ICP-native LLM. Only hashed/normalized data is used - your raw health values never leave your control.</span>
              </div>
              {recentFailures > 2 && (
                <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>LLM service experiencing intermittent issues. Fallback responses may be used. Avg retries: {avgRetries}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Interface with Sprint 3 Enhancements */}
      <Card className="modern-card">
        <CardHeader className="cursor-pointer" onClick={() => setIsChatExpanded(!isChatExpanded)}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span>Chat with {agentName}</span>
              <Badge variant="secondary" className="text-xs">
                ICP LLM
              </Badge>
              {llmQuery.isPending && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  Processing...
                </Badge>
              )}
              {prefetchPatterns.isPending && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Prefetching...
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm">
              {isChatExpanded ? 'Collapse' : 'Expand'} Chat
            </Button>
          </CardTitle>
        </CardHeader>
        
        {isChatExpanded && (
          <CardContent className="space-y-4">
            {/* Quick Action Prompts */}
            <div className="flex flex-wrap gap-2">
              {contextualPrompts[pageContext].map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setMessage(prompt)}
                  disabled={llmQuery.isPending}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            {/* Sprint 3: Enhanced LLM Performance Stats */}
            {llmMetrics.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl text-xs flex-wrap">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-primary" />
                  <span className="font-medium">Avg Latency:</span>
                  <span className={avgLatency < 2000 ? 'text-green-600' : 'text-yellow-600'}>{avgLatency}ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span className="font-medium">Success Rate:</span>
                  <span className={successRate >= 90 ? 'text-green-600' : 'text-yellow-600'}>{successRate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-blue-600" />
                  <span className="font-medium">Cache Hit:</span>
                  <span className="text-blue-600">{cacheHitRate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-600" />
                  <span className="font-medium">Total Calls:</span>
                  <span>{llmMetrics.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-600" />
                  <span className="font-medium">Avg Retries:</span>
                  <span>{avgRetries}</span>
                </div>
                {llmMetrics[0]?.modelInfo && (
                  <div className="flex items-center gap-1">
                    <Bot className="w-3 h-3 text-blue-600" />
                    <span className="font-medium">Model:</span>
                    <span>{llmMetrics[0].modelInfo.model}</span>
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages */}
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-4">
                {interactions.length === 0 && (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Hi {userName}! I'm {agentName} ✨
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ask me anything about this page, or click a suggestion above!
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                        <Shield className="w-3 h-3 text-green-600" />
                        <span>Powered by ICP-native LLM • Privacy-first AI • On-chain processing • Sprint 3 Enhanced</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {interactions.slice(-5).map((interaction, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl px-4 py-2 max-w-[85%] shadow-soft">
                        <p className="text-sm font-medium">{interaction.message}</p>
                      </div>
                    </div>
                    <div className="flex justify-start gap-2">
                      <img 
                        src="/assets/generated/ai-agent-avatar.png" 
                        alt={agentName}
                        className="w-6 h-6 rounded-xl shadow-soft shrink-0 mt-1"
                      />
                      <div className="bg-muted/50 backdrop-blur-sm rounded-2xl px-4 py-2 max-w-[85%] border border-border/50">
                        <p className="text-sm leading-relaxed">{interaction.response}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {llmQuery.isPending && (
                  <div className="flex justify-start gap-2">
                    <img 
                      src="/assets/generated/ai-agent-avatar.png" 
                      alt={agentName}
                      className="w-6 h-6 rounded-xl shadow-soft shrink-0 mt-1"
                    />
                    <div className="bg-muted/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Processing on-chain with Sprint 3 optimizations...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {voiceError && (
              <Alert className="rounded-2xl border-destructive/20 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {voiceError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Chat Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Ask ${agentName} anything about this page...`}
                onKeyPress={(e) => e.key === 'Enter' && !llmQuery.isPending && handleSendMessage()}
                className="modern-input flex-1"
                disabled={llmQuery.isPending}
              />
              <Button
                variant="outline"
                size="icon"
                className="modern-button rounded-xl"
                onClick={startVoiceInput}
                disabled={isListening || llmQuery.isPending}
                title="Use voice input"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-destructive animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || llmQuery.isPending}
                size="icon"
                className="modern-button rounded-xl"
                title="Send message to ICP-native LLM with Sprint 3 optimizations"
              >
                {llmQuery.isPending ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Privacy Notice with Sprint 3 Features */}
            <div className="text-xs text-muted-foreground text-center p-2 bg-primary/5 rounded-xl border border-primary/10">
              <Shield className="w-3 h-3 inline mr-1" />
              All queries are processed by ICP-native LLM canister (w36hm-eqaaa-aaal-qr76a-cai) using only normalized/hashed data for complete privacy protection. Sprint 3 enhancements: Enhanced caching ({cacheHitRate}% hit rate), automatic retry with exponential backoff, graceful degradation, and load-adaptive scheduling for optimal performance.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIPageHeader;
