import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  FileText,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface ContextualHelpProps {
  page: 'dashboard' | 'health-labs' | 'defi' | 'shop' | 'schedule';
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ page }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const helpContent = {
    dashboard: {
      title: 'Dashboard Help',
      description: 'Your central hub for health tracking across 8 wellness domains',
      sections: [
        {
          title: 'Understanding Your Health Score',
          content: 'Your overall health score (0-100) is calculated from all 8 domains: Fitness, Nutrition, Recovery, Finances, Longevity, Purpose, Environment, and Community. Each domain contributes equally to your total score.',
          icon: CheckCircle
        },
        {
          title: 'Domain Cards',
          content: 'Click any domain card to see detailed progress, metrics, and personalized recommendations. Cards show your top priority, current score, and wearable sync status.',
          icon: FileText
        },
        {
          title: 'Proof of Life Submissions',
          content: 'Submit daily health data (steps, protein, sleep) to earn Ascend tokens. Meeting minimum thresholds (10k steps, 100g protein, 7h sleep) earns you 10 tokens per day.',
          icon: CheckCircle
        }
      ],
      advanced: [
        {
          title: 'Customizing Your Dashboard',
          content: 'Reorder domain cards by dragging them, hide sections you don\'t use, and set notification preferences in Settings > Dashboard Preferences.',
          icon: FileText
        }
      ],
      videoUrl: null
    },
    'health-labs': {
      title: 'Health Labs Help',
      description: 'Track 100+ health indicators and analyze your biomarkers',
      sections: [
        {
          title: 'Health Indicators Table',
          content: 'View all your health metrics from wearables and lab results. Use filters to find specific indicators, and export data for your records.',
          icon: FileText
        },
        {
          title: 'Custom Chart Builder',
          content: 'Create personalized charts to visualize trends. Select metrics, choose time ranges, and use zoom/pan to explore your data in detail.',
          icon: CheckCircle
        },
        {
          title: 'Uploading Lab Results',
          content: 'Upload images or PDFs of lab results. Our AI-powered OCR extracts biomarkers automatically and compares them to healthy benchmarks.',
          icon: FileText
        }
      ],
      advanced: [
        {
          title: 'Benchmark Comparisons',
          content: 'All biomarkers are compared against industry standards (AHA, ADA, Endocrine Society). Green = optimal, yellow = suboptimal, red = critical.',
          icon: CheckCircle
        }
      ],
      videoUrl: null
    },
    defi: {
      title: 'DeFi Dashboard Help',
      description: 'Manage your Ascend tokens, staking, and rewards',
      sections: [
        {
          title: 'Staking Basics',
          content: 'Lock your Ascend tokens for 30-365 days to earn rewards. Longer lockup periods offer higher APY and reward multipliers. Tokens cannot be unstaked before the lockup period ends.',
          icon: CheckCircle
        },
        {
          title: 'Token Swaps',
          content: 'Exchange Ascend tokens for USDT or ICP using ICPSwap DEX. Swaps include a 0.3% trading fee and 1% slippage protection.',
          icon: FileText
        },
        {
          title: 'Liquidity Pools',
          content: 'Provide liquidity to Ascend/ICP or Ascend/USDT pools to earn trading fees. Your rewards are proportional to your share of the pool.',
          icon: CheckCircle
        }
      ],
      advanced: [
        {
          title: 'Understanding APY',
          content: 'Annual Percentage Yield (APY) shows your potential yearly earnings. Actual rewards depend on lockup period, token amount, and reward multipliers.',
          icon: FileText
        },
        {
          title: 'Impermanent Loss',
          content: 'When providing liquidity, if token prices diverge significantly, you may experience impermanent loss. This is the difference between holding tokens vs. providing liquidity.',
          icon: CheckCircle
        }
      ],
      videoUrl: null
    },
    shop: {
      title: 'Health Shop Help',
      description: 'Browse personalized health products and protocols',
      sections: [
        {
          title: 'Product Recommendations',
          content: 'Products are recommended based on your health data, goals, and lab results. AI analyzes your normalized health patterns to suggest optimal supplements and protocols.',
          icon: CheckCircle
        },
        {
          title: 'Payment Options',
          content: 'Pay with USD or Ascend tokens. Token prices are typically 50% of USD prices. Referred users get an automatic 10% discount on all purchases.',
          icon: FileText
        },
        {
          title: 'Suggesting Brands',
          content: 'Don\'t see your favorite brand? Use the "Suggest a Brand" form to recommend new products. We review all suggestions and notify you when they\'re added.',
          icon: CheckCircle
        }
      ],
      advanced: [],
      videoUrl: null
    },
    schedule: {
      title: 'Weekly Schedule Help',
      description: 'Plan and optimize your health routines',
      sections: [
        {
          title: 'Calendar Integration',
          content: 'Connect Google Calendar, Apple Calendar, or Outlook to auto-populate health routines. Your workouts, meal prep, and mindfulness sessions sync automatically.',
          icon: CheckCircle
        },
        {
          title: 'AI Schedule Optimization',
          content: 'Ask the AI assistant to optimize your schedule based on your energy patterns, recovery needs, and goals. It suggests the best times for workouts and activities.',
          icon: FileText
        },
        {
          title: 'Drag-and-Drop Scheduling',
          content: 'Easily reschedule activities by dragging them to new time slots. Changes sync across all connected calendars.',
          icon: CheckCircle
        }
      ],
      advanced: [],
      videoUrl: null
    }
  };

  const content = helpContent[page];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="modern-button"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Help
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {content.title}
            </DialogTitle>
            <DialogDescription>
              {content.description}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {/* Basic Help Sections */}
              {content.sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-semibold">{section.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                      {section.content}
                    </p>
                  </div>
                );
              })}

              {/* Advanced Help Toggle */}
              {content.advanced.length > 0 && (
                <>
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full"
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Help
                    </Button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-6 pt-4">
                      <Badge variant="secondary" className="mb-2">
                        Advanced Topics
                      </Badge>
                      {content.advanced.map((section, index) => {
                        const Icon = section.icon;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-accent/10 rounded-lg">
                                <Icon className="w-4 h-4 text-accent" />
                              </div>
                              <h3 className="font-semibold">{section.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                              {section.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Video Tutorial Link */}
              {content.videoUrl && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(content.videoUrl!, '_blank')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Watch Video Tutorial
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              )}

              {/* Additional Resources */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Need more help? Contact support or visit our documentation.
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContextualHelp;
