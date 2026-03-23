import React, { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetCallerUserProfile, useAddAgentInteraction, useGetAgentInteractions } from '../hooks/useQueries';
import { AgentInteraction, HealthDomain } from '../backend';
import { MessageCircle, Send, Mic, MicOff, X, Sparkles, AlertCircle, Bot, Activity, Apple, Brain, DollarSign, Users, Leaf, Target, Heart } from 'lucide-react';
import { toast } from 'sonner';

const FloatingAgent: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showDomainOrbs, setShowDomainOrbs] = useState(false);
  
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: interactions = [] } = useGetAgentInteractions();
  const addInteraction = useAddAgentInteraction();

  const agentName = userProfile?.agentName || 'Aria';
  const userName = userProfile?.name || 'there';

  const domains = [
    { 
      name: HealthDomain.fitness, 
      title: 'Fitness', 
      color: 'from-green-400 to-emerald-500',
      icon: Activity,
      orbImage: '/assets/generated/fitness-orb-small.png'
    },
    { 
      name: HealthDomain.nutrition, 
      title: 'Nutrition', 
      color: 'from-orange-400 to-red-500',
      icon: Apple,
      orbImage: '/assets/generated/nutrition-orb-small.png'
    },
    { 
      name: HealthDomain.mental, 
      title: 'Mental Health', 
      color: 'from-blue-400 to-indigo-500',
      icon: Brain,
      orbImage: '/assets/generated/mental-orb-small.png'
    },
    { 
      name: HealthDomain.finances, 
      title: 'Finances', 
      color: 'from-yellow-400 to-orange-500',
      icon: DollarSign,
      orbImage: '/assets/generated/finances-orb-small.png'
    },
    { 
      name: HealthDomain.community, 
      title: 'Community', 
      color: 'from-purple-400 to-pink-500',
      icon: Users,
      orbImage: '/assets/generated/community-orb-small.png'
    },
    { 
      name: HealthDomain.environment, 
      title: 'Environment', 
      color: 'from-teal-400 to-cyan-500',
      icon: Leaf,
      orbImage: '/assets/generated/environment-orb-small.png'
    },
    { 
      name: HealthDomain.purpose, 
      title: 'Purpose', 
      color: 'from-red-400 to-pink-500',
      icon: Target,
      orbImage: '/assets/generated/purpose-orb-small.png'
    },
    { 
      name: HealthDomain.longevity, 
      title: 'Longevity', 
      color: 'from-gray-400 to-slate-500',
      icon: Heart,
      orbImage: '/assets/generated/longevity-orb-small.png'
    },
  ];

  // Enhanced response generation with personalized user name
  const generateResponse = (userMessage: string): string => {
    const responses = {
      greeting: [
        `Hello ${userName}! I'm ${agentName}, your wellness companion. How can I help you today? ✨`,
        `Hi there, ${userName}! ${agentName} here. What would you like to work on for your wellness journey? 🌟`,
        `Great to see you, ${userName}! I'm ${agentName}. How are you feeling today? 💚`
      ],
      fitness: [
        `🏃‍♀️ Great question about fitness, ${userName}! I recommend starting with 30 minutes of moderate exercise daily. Would you like me to suggest a specific workout routine?`,
        `💪 Fitness is key to overall wellness, ${userName}! Consider mixing cardio and strength training. Your current fitness score shows good progress!`,
        `🎯 For fitness goals, ${userName}, consistency is more important than intensity. Let's build a sustainable routine together!`
      ],
      nutrition: [
        `🥗 Nutrition is the foundation of health, ${userName}! Focus on whole foods, plenty of vegetables, and staying hydrated. What's your biggest nutrition challenge?`,
        `🍎 Great nutrition question, ${userName}! Remember the 80/20 rule - eat well 80% of the time, and allow flexibility for the other 20%.`,
        `🥑 For better nutrition, ${userName}, try meal prepping and keeping healthy snacks handy. Your body will thank you!`
      ],
      mental: [
        `🧘‍♀️ Mental health is just as important as physical health, ${userName}. Have you tried meditation or mindfulness practices?`,
        `💚 Taking care of your mental wellbeing is wonderful, ${userName}! Consider journaling, deep breathing, or talking to someone you trust.`,
        `🌱 Mental wellness grows with practice, ${userName}. Small daily habits like gratitude or meditation can make a big difference.`
      ],
      motivation: [
        `🌟 You're doing amazing, ${userName}! Every small step counts toward your wellness goals. Keep up the great work!`,
        `✨ Remember, ${userName}, progress isn't always linear. Celebrate your wins, learn from setbacks, and keep moving forward!`,
        `🎉 I believe in you, ${userName}! Your commitment to wellness is inspiring. What's one thing you're proud of today?`
      ],
      privacy: [
        `🔒 Your privacy is our top priority, ${userName}! All your data is encrypted and stored securely on the Internet Computer. We never share your information with third parties.`,
        `🛡️ Great question about privacy, ${userName}! Your wellness data stays completely private and is only used to provide you with personalized recommendations.`,
        `🌐 We use privacy-first technology, ${userName}, to ensure your health information remains confidential and secure.`
      ],
      features: [
        `🚀 I'm constantly learning and improving, ${userName}! While some advanced features are still in development, I'm here to help with wellness guidance, motivation, and tracking your progress.`,
        `⭐ I can help you with fitness advice, nutrition tips, mental health support, and tracking your wellness journey, ${userName}. What would you like to explore?`,
        `🎯 My current capabilities include personalized wellness advice, progress tracking, and motivational support, ${userName}. Advanced AI features are coming soon!`
      ],
      default: [
        `That's an interesting question, ${userName}! As ${agentName}, I'm here to support your wellness journey. Could you tell me more about what specific area you'd like help with? 🤔`,
        `I'm here to help with your health and wellness goals, ${userName}! Whether it's fitness, nutrition, mental health, or any other domain, I'm ready to assist. 💪`,
        `${agentName} at your service, ${userName}! I can help with fitness, nutrition, mental health, finances, community, environment, purpose, and longevity. What interests you most? ✨`
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else if (lowerMessage.includes('fitness') || lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return responses.fitness[Math.floor(Math.random() * responses.fitness.length)];
    } else if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return responses.nutrition[Math.floor(Math.random() * responses.nutrition.length)];
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mood')) {
      return responses.mental[Math.floor(Math.random() * responses.mental.length)];
    } else if (lowerMessage.includes('motivat') || lowerMessage.includes('encourage') || lowerMessage.includes('support')) {
      return responses.motivation[Math.floor(Math.random() * responses.motivation.length)];
    } else if (lowerMessage.includes('privacy') || lowerMessage.includes('data') || lowerMessage.includes('secure')) {
      return responses.privacy[Math.floor(Math.random() * responses.privacy.length)];
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('can you') || lowerMessage.includes('what do')) {
      return responses.features[Math.floor(Math.random() * responses.features.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setIsTyping(true);

    try {
      // Simulate realistic AI response time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const response = generateResponse(userMessage);
      
      const interaction: AgentInteraction = {
        message: userMessage,
        response: response,
        timestamp: BigInt(Date.now())
      };

      await addInteraction.mutateAsync(interaction);
      
      // Use browser's built-in Text-to-Speech for response
      if ('speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(response);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.log('TTS not available:', error);
        }
      }
      
    } catch (error) {
      console.error('Message send error:', error);
      toast.error('Failed to send message. Please check your connection.');
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceInput = () => {
    // Use browser's built-in Speech Recognition API
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

  const handleDomainClick = (domain: typeof domains[0]) => {
    setIsOpen(false);
    setShowDomainOrbs(false);
    router.navigate({ to: `/domain/${domain.name}` });
  };

  const toggleDomainOrbs = () => {
    setShowDomainOrbs(!showDomainOrbs);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Domain orbs when expanded */}
        {showDomainOrbs && (
          <div className="absolute bottom-20 right-0 grid grid-cols-2 gap-3 p-4 bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-glow animate-scale-in">
            {domains.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <button
                  key={domain.name}
                  onClick={() => handleDomainClick(domain)}
                  className={`relative p-3 rounded-2xl bg-gradient-to-br ${domain.color}/10 hover:${domain.color}/20 border border-border/50 transition-all duration-300 hover:scale-105 group`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  title={`Chat about ${domain.title}`}
                >
                  <div className={`w-8 h-8 mx-auto rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs font-medium text-center">{domain.title}</div>
                </button>
              );
            })}
          </div>
        )}
        
        {/* Main chat bubble */}
        <div 
          className="floating-agent flex items-center justify-center animate-float cursor-pointer"
          onClick={() => setIsOpen(true)}
          onDoubleClick={toggleDomainOrbs}
          title={`Chat with ${agentName} (double-click for quick domain access)`}
        >
          <div className="relative">
            <img 
              src="/assets/generated/ai-agent-avatar.png" 
              alt={agentName}
              className="w-16 h-16 rounded-3xl shadow-soft"
            />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            {showDomainOrbs && (
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-primary rounded-full animate-ping"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[32rem] modern-card p-0 animate-scale-in">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6 pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold">
            <div className="relative">
              <img 
                src="/assets/generated/ai-agent-avatar.png" 
                alt={agentName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl shadow-soft"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800">
                <Bot className="w-1 h-1 sm:w-2 sm:h-2 text-white m-0.5" />
              </div>
            </div>
            <div>
              <div className="gradient-text font-black text-sm sm:text-base">{agentName}</div>
              <div className="text-xs text-muted-foreground font-normal">AI Wellness Companion</div>
            </div>
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="sm"
            className="modern-button rounded-2xl"
            onClick={() => setIsOpen(false)}
            title="Close chat"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </DialogHeader>
        
        <div className="flex flex-col h-full p-4 sm:p-6 pt-0 space-y-4">
          {/* Domain Orbs for Quick Navigation */}
          <div className="py-2 sm:py-4">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3">Quick Domain Chat</h3>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {domains.map((domain) => {
                const Icon = domain.icon;
                return (
                  <button
                    key={domain.name}
                    onClick={() => handleDomainClick(domain)}
                    className={`relative p-2 sm:p-3 rounded-2xl bg-gradient-to-br ${domain.color}/10 hover:${domain.color}/20 border border-border/50 transition-all duration-300 hover:scale-105 group`}
                    title={`Chat about ${domain.title}`}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-center">{domain.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <ScrollArea className="flex-1 pr-2 sm:pr-4">
            <div className="space-y-4 sm:space-y-6">
              {interactions.length === 0 && (
                <div className="text-center py-6 sm:py-8 space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base sm:text-lg font-semibold">
                      Hi {userName}! I'm {agentName} ✨
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Your personal wellness companion. Ask me anything about your health journey, or click a domain above for specific guidance!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Fitness tips', 'Nutrition advice', 'Mental health', 'Custom metrics'].map((topic) => (
                      <Button
                        key={topic}
                        variant="outline"
                        size="sm"
                        className="rounded-2xl text-xs"
                        onClick={() => setMessage(`Tell me about ${topic.toLowerCase()}`)}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {interactions.slice(-10).map((interaction, index) => (
                <div key={index} className="space-y-3 sm:space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-3xl px-4 py-2 sm:px-6 sm:py-3 max-w-[85%] shadow-soft">
                      <p className="text-xs sm:text-sm font-medium">{interaction.message}</p>
                    </div>
                  </div>
                  <div className="flex justify-start gap-2 sm:gap-3">
                    <img 
                      src="/assets/generated/ai-agent-avatar.png" 
                      alt={agentName}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-2xl shadow-soft shrink-0 mt-1"
                    />
                    <div className="bg-muted/50 backdrop-blur-sm rounded-3xl px-4 py-2 sm:px-6 sm:py-3 max-w-[85%] border border-border/50">
                      <p className="text-xs sm:text-sm leading-relaxed">{interaction.response}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start gap-2 sm:gap-3">
                  <img 
                    src="/assets/generated/ai-agent-avatar.png" 
                    alt={agentName}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-2xl shadow-soft shrink-0 mt-1"
                  />
                  <div className="bg-muted/50 backdrop-blur-sm rounded-3xl px-4 py-2 sm:px-6 sm:py-3 border border-border/50">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          
          <div className="flex gap-2 sm:gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Ask ${agentName} anything...`}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="modern-input flex-1 text-sm sm:text-base"
            />
            <Button
              variant="outline"
              size="icon"
              className="modern-button rounded-2xl"
              onClick={startVoiceInput}
              disabled={isListening}
              title="Use voice input"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-destructive animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || addInteraction.isPending}
              size="icon"
              className="modern-button rounded-2xl"
              title="Send message"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FloatingAgent;
