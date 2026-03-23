import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import JudgeAgentDashboard from '../components/JudgeAgentDashboard';
import JudgeArbitrationDashboard from '../components/JudgeArbitrationDashboard';
import BlackboardWriteLockInterface from '../components/BlackboardWriteLockInterface';
import BlackboardDomainRegistry from '../components/BlackboardDomainRegistry';
import DomainRegistrationLogs from '../components/DomainRegistrationLogs';
import QAPartnerAgentDashboard from '../components/QAPartnerAgentDashboard';
import AdaptiveLearningDashboard from '../components/AdaptiveLearningDashboard';

export default function SprintDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sprint Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Production-grade monitoring for Sprint 1, Sprint 2, Sprint 3, and Nano Step 6 implementations
        </p>
      </div>

      <Tabs defaultValue="sprint1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sprint1">Sprint 1: Judge Agent</TabsTrigger>
          <TabsTrigger value="sprint2">Sprint 2 Phase A: Blackboard</TabsTrigger>
          <TabsTrigger value="sprint3">Sprint 3: DeAI Performance</TabsTrigger>
          <TabsTrigger value="nano6">Nano 6: Adaptive Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="sprint1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint 1: Foundational Agent Governance Layer</CardTitle>
              <CardDescription>
                Production-grade Judge Agent implementation with passive startup, hop-counter protection,
                timeout guards, and comprehensive governance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Hop Counter Protection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Max 15 Hops</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prevents recursive/circular agent calls
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Timeout Guard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5s Maximum</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatic abort/degradation on timeout
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Conditional Heartbeat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Cycle Conservation</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active query detection with auto-pause
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <JudgeAgentDashboard />
        </TabsContent>

        <TabsContent value="sprint2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint 2 Phase A: Blackboard Core Data Model</CardTitle>
              <CardDescription>
                Inter-agent insight sharing and coordination with lazy initialization, access control safety,
                write-lock mechanism, heartbeat verification, JudgeAgent arbitration integration, and QA Partner Agent semantic validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">BlackboardEntry</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">✓ Complete</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Domain, insight, confidence, timestamp, source
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Lazy Initialization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">✓ Complete</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        First-access creation with access control
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Write-Lock</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">✓ Complete</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Boolean flag without Debug.trap
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Arbitration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">✓ Complete</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deterministic formula with logging
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">QA Validation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">✓ Complete</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Semantic validation & rollback
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlackboardWriteLockInterface />
            <BlackboardDomainRegistry />
          </div>

          <JudgeArbitrationDashboard />

          <QAPartnerAgentDashboard />

          <DomainRegistrationLogs />
        </TabsContent>

        <TabsContent value="sprint3" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint 3: DeAI Stability & Performance</CardTitle>
              <CardDescription>
                ICP-native LLM optimization with caching, prefetch, batch inference, and load-adaptive scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Latency Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">25%+ Target</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Verified reduction in LLM response times
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">80%+ Target</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Per-user session optimization
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Error Handling</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">95%+ Coverage</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Graceful degradation with fallback
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DeAI Performance Metrics</CardTitle>
              <CardDescription>
                Real-time monitoring of ICP-native LLM optimization effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                DeAI performance monitoring components will be integrated here with comprehensive
                caching effectiveness, prefetch accuracy, batch inference efficiency, and load-adaptive
                scheduling performance metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nano6" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nano Step 6: Adaptive Learning Feedback Loops</CardTitle>
              <CardDescription>
                Continuous adaptive intelligence across all agents via feedback loops that learn from system corrections,
                Sentinel alerts, and QA Partner validations to improve decision accuracy and operational harmony
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Adaptation Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">≥95% Target</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Semantic correction alignment
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Feedback Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">&lt;10s Target</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Correction application rate (CAR)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Learning Efficiency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">≥95% Target</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Improvement from corrections
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <AdaptiveLearningDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
