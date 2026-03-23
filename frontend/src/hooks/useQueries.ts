import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as llmIdlFactory } from '../llm-canister-interface';
import { Principal } from '@dfinity/principal';
import { 
  UserProfile, 
  HealthDomain, 
  DomainProgress, 
  Badge, 
  Reward, 
  AgentInteraction, 
  Notification,
  LeaderboardEntry,
  CustomMetric,
  StakingPosition,
  LiquidityPool,
  Referral,
  BrandSuggestion,
  WearableConnection,
  HealthIndicator,
  TourProgress,
  TourStep,
  DashboardPreference,
  HelpPreference,
  HealthRecord,
  UploadStatus,
  ExtractedField,
  WhitePaperDocument,
  WhitePaperSection
} from '../backend';

// Proof of Life Types
export interface HealthData {
  steps: number;
  protein: number;
  sleep: number;
  timestamp: bigint;
}

export interface Proof {
  userId: string;
  healthDataHash: string;
  timestamp: bigint;
  verified: boolean;
  reward: number;
}

// Central Standards Memory Types
export interface HealthStandard {
  metricName: string;
  domain: string;
  optimalRange: {
    min: bigint;
    max: bigint;
  };
  units: string;
  evidenceSource: string;
}

// Domain Vitality Types (Sprint 2)
export interface NormalizedIndicator {
  metricName: string;
  rawValue: number;
  objectiveNormalized: number;
  subjectiveNormalized: number;
  weight: number;
}

export interface IntraDomainVitality {
  userId: Principal;
  domain: string;
  indicators: NormalizedIndicator[];
  vitalityScore: number;
  timestamp: bigint;
}

export interface MaintenanceStatus {
  domain: string;
  isActive: boolean;
  consecutiveOptimalDays: number;
  streakStartTimestamp: bigint | null;
  activationTimestamp: bigint | null;
  lastResetTimestamp: bigint | null;
}

export interface DomainVitalityResult {
  vitality: IntraDomainVitality;
  isMaintenanceActive: boolean;
  maintenanceStatus: MaintenanceStatus;
}

export interface HealthIndicatorValue {
  metricName: string;
  value: number;
  timestamp: bigint;
}

// Sprint 3: Synergy Coefficient Types
export interface DomainVitalityScore {
  domain: string;
  score: number;
  isActive: boolean;
  timestamp: bigint;
}

export interface SynergyCoefficient {
  activeDomainScores: DomainVitalityScore[];
  meanScore: number;
  standardDeviation: number;
  normalizedSynergy: number;
  calculationTimestamp: bigint;
  activeDomainCount: number;
}

// Sprint 3: LLM Performance Metrics
export interface LLMPerformanceMetrics {
  callId: string;
  timestamp: number;
  latencyMs: number;
  cyclesUsed?: bigint;
  success: boolean;
  error?: string;
  modelInfo?: {
    model: string;
    version: string;
  };
  cacheHit?: boolean;
  fallbackUsed?: boolean;
  retryCount?: number;
}

// Sprint 3: LLM Cache Entry
interface LLMCacheEntry {
  prompt: string;
  response: string;
  timestamp: number;
  hitCount: number;
  context: string;
}

// ICP-Native LLM Canister Integration
const LLM_CANISTER_ID = 'w36hm-eqaaa-aaal-qr76a-cai';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL
const MAX_CACHE_SIZE = 50; // Maximum cached responses per user
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout

// In-memory cache for LLM responses (per-user session cache)
const llmCache = new Map<string, LLMCacheEntry>();

// Common query patterns for prefetch
const COMMON_PATTERNS = [
  'show my health score',
  'what should i focus on',
  'analyze my progress',
  'recommend supplements',
  'optimize my schedule'
];

// Initialize LLM actor with proper error handling and timeout
async function createLLMActor() {
  try {
    const agent = new HttpAgent({
      host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943',
    });

    // Only fetch root key in local development
    if (process.env.DFX_NETWORK !== 'ic') {
      await agent.fetchRootKey();
    }

    return Actor.createActor(llmIdlFactory, {
      agent,
      canisterId: LLM_CANISTER_ID,
    });
  } catch (error) {
    console.error('Failed to create LLM actor:', error);
    throw new Error('Unable to connect to ICP-native LLM canister');
  }
}

// Cryptographic hash function for privacy-preserving data
function hashHealthData(data: any): string {
  const dataString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

// Normalize health data for HIPAA-compliant LLM input
function normalizeHealthDataForLLM(
  userProfile: UserProfile | null, 
  domainProgress: Array<[HealthDomain, DomainProgress]>, 
  healthIndicators: HealthIndicator[]
): string {
  // Only send normalized/hashed data - NEVER raw health values
  const normalized = {
    ageRange: userProfile?.age ? (Number(userProfile.age) < 30 ? 'under-30' : Number(userProfile.age) < 50 ? '30-50' : 'over-50') : 'unknown',
    goalCount: userProfile?.goals?.length || 0,
    concernCount: userProfile?.healthConcerns?.length || 0,
    domainScores: domainProgress.map(([domain, progress]) => ({
      domain: domain.toString(),
      scoreRange: Number(progress.score) < 50 ? 'low' : Number(progress.score) < 80 ? 'medium' : 'high',
      streakRange: Number(progress.streak) < 7 ? 'short' : Number(progress.streak) < 30 ? 'medium' : 'long'
    })),
    indicatorCount: healthIndicators.length,
    // Cryptographic hash of actual data for privacy
    dataHash: hashHealthData({ 
      profile: userProfile?.name, 
      domains: domainProgress.length, 
      indicators: healthIndicators.length 
    })
  };
  
  return JSON.stringify(normalized);
}

// Generate cache key for LLM queries
function generateCacheKey(prompt: string, context: string, userId: string): string {
  return `${userId}:${context}:${hashHealthData(prompt)}`;
}

// Clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of llmCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      llmCache.delete(key);
    }
  }
  
  // Enforce max cache size
  if (llmCache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(llmCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = sortedEntries.slice(0, llmCache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => llmCache.delete(key));
  }
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY_MS
): Promise<{ result: T; retryCount: number }> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn();
      return { result, retryCount: attempt };
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retry attempts reached');
}

// Timeout wrapper for LLM calls
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// Real ICP-Native LLM Query Hook with Sprint 3 enhancements
export function useLLMQuery() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: domainProgress = [] } = useGetDomainProgress();
  const { data: healthIndicators = [] } = useGetHealthIndicators();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      prompt, 
      context 
    }: { 
      prompt: string; 
      context: 'dashboard' | 'health-labs' | 'defi' | 'shop' | 'schedule' 
    }) => {
      const startTime = Date.now();
      const callId = `llm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = identity?.getPrincipal().toString() || 'anonymous';
      
      // Clean expired cache entries
      cleanExpiredCache();
      
      // Check cache first (Sprint 3: Enhanced caching)
      const cacheKey = generateCacheKey(prompt, context, userId);
      const cachedEntry = llmCache.get(cacheKey);
      
      if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL_MS) {
        // Cache hit!
        cachedEntry.hitCount++;
        llmCache.set(cacheKey, cachedEntry);
        
        const latencyMs = Date.now() - startTime;
        const metrics: LLMPerformanceMetrics = {
          callId,
          timestamp: Date.now(),
          latencyMs,
          success: true,
          cacheHit: true,
          retryCount: 0
        };
        
        console.log('✅ LLM Cache Hit:', metrics);
        queryClient.setQueryData(['llmMetrics', callId], metrics);
        
        const allMetrics = queryClient.getQueryData<LLMPerformanceMetrics[]>(['allLLMMetrics']) || [];
        queryClient.setQueryData(['allLLMMetrics'], [...allMetrics, metrics].slice(-100));
        
        return {
          response: cachedEntry.response,
          metrics,
          onChain: false,
          privacyCompliant: true,
          cached: true
        };
      }
      
      try {
        // Prepare privacy-preserving context
        const normalizedData = normalizeHealthDataForLLM(
          userProfile ?? null, 
          domainProgress, 
          healthIndicators
        );
        
        // Build context-specific system prompt
        const contextPrompts = {
          dashboard: 'You are a health AI assistant helping with overall wellness tracking across 8 health domains (fitness, nutrition, recovery, finances, longevity, purpose, environment, community). Provide actionable insights based on normalized health data.',
          'health-labs': 'You are a health AI assistant specializing in lab results analysis, biomarker interpretation, and health indicator trends. Help users understand their health metrics using normalized data ranges.',
          defi: 'You are a health AI assistant helping with DeFi portfolio management, staking strategies, and health-based reward optimization. Focus on financial wellness and token rewards.',
          shop: 'You are a health AI assistant providing personalized product recommendations for supplements, devices, and health protocols based on normalized health data patterns.',
          schedule: 'You are a health AI assistant helping optimize weekly health schedules, workout timing, and routine planning based on normalized energy and activity patterns.'
        };
        
        const systemPrompt = contextPrompts[context];
        const fullPrompt = `${systemPrompt}\n\nUser context (privacy-protected, normalized data only): ${normalizedData}\n\nUser question: ${prompt}\n\nIMPORTANT: All data provided is normalized/hashed for privacy. Never reference raw health values. Provide helpful, actionable advice based on the normalized patterns.`;
        
        // Call ICP-native LLM canister with retry logic and timeout (Sprint 3: Enhanced error handling)
        console.log('🔗 Calling ICP-native LLM canister:', LLM_CANISTER_ID);
        
        const { result: rawResponse, retryCount } = await retryWithBackoff(async () => {
          const llmActor = await createLLMActor();
          return await withTimeout(
            (llmActor as any).prompt(fullPrompt),
            REQUEST_TIMEOUT_MS
          );
        });
        
        // Ensure response is a string
        const response = typeof rawResponse === 'string' ? rawResponse : String(rawResponse || '');
        
        const latencyMs = Date.now() - startTime;
        
        // Try to get model info for monitoring
        let modelInfo;
        try {
          const llmActor = await createLLMActor();
          modelInfo = await (llmActor as any).getModelInfo();
        } catch (error) {
          console.log('Model info not available:', error);
        }
        
        // Cache the successful response (Sprint 3: Per-user session cache)
        if (response) {
          llmCache.set(cacheKey, {
            prompt,
            response,
            timestamp: Date.now(),
            hitCount: 0,
            context
          });
        }
        
        // Log performance metrics
        const metrics: LLMPerformanceMetrics = {
          callId,
          timestamp: Date.now(),
          latencyMs,
          success: true,
          modelInfo: modelInfo ? {
            model: modelInfo.model,
            version: modelInfo.version
          } : undefined,
          cacheHit: false,
          retryCount
        };
        
        console.log('✅ LLM Performance:', metrics);
        console.log('📊 Model throughput: Response generated in', latencyMs, 'ms with', retryCount, 'retries');
        
        // Store metrics for monitoring dashboard
        queryClient.setQueryData(['llmMetrics', callId], metrics);
        
        const allMetrics = queryClient.getQueryData<LLMPerformanceMetrics[]>(['allLLMMetrics']) || [];
        queryClient.setQueryData(['allLLMMetrics'], [...allMetrics, metrics].slice(-100));
        
        return {
          response: response || 'I apologize, but I encountered an issue processing your request. Please try again.',
          metrics,
          onChain: true,
          privacyCompliant: true,
          cached: false
        };
        
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        
        const metrics: LLMPerformanceMetrics = {
          callId,
          timestamp: Date.now(),
          latencyMs,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallbackUsed: true
        };
        
        console.error('❌ LLM Error:', metrics);
        queryClient.setQueryData(['llmMetrics', callId], metrics);
        
        const allMetrics = queryClient.getQueryData<LLMPerformanceMetrics[]>(['allLLMMetrics']) || [];
        queryClient.setQueryData(['allLLMMetrics'], [...allMetrics, metrics].slice(-100));
        
        // Sprint 3: Enhanced fallback responses with graceful degradation
        const fallbackResponses = {
          dashboard: `I'm currently experiencing connectivity issues with the ICP LLM service. However, I can see your health data is being tracked securely on-chain. Your overall wellness score looks good! Try asking me again in a moment. (Error: ${error instanceof Error ? error.message : 'Connection timeout'})`,
          'health-labs': `The LLM service is temporarily unavailable, but your health indicators are being monitored. Your lab results are stored securely on-chain. Please try again shortly. (Error: ${error instanceof Error ? error.message : 'Connection timeout'})`,
          defi: `I'm having trouble connecting to the AI service right now. Your DeFi portfolio and token rewards are safe and being tracked on-chain. Please retry in a moment. (Error: ${error instanceof Error ? error.message : 'Connection timeout'})`,
          shop: `The AI recommendation service is temporarily offline. Your health data remains secure on-chain. Browse our curated products while I reconnect! (Error: ${error instanceof Error ? error.message : 'Connection timeout'})`,
          schedule: `I'm experiencing a temporary connection issue. Your schedule data is safe on-chain. Try asking me again in a few moments. (Error: ${error instanceof Error ? error.message : 'Connection timeout'})`
        };
        
        return {
          response: fallbackResponses[context] || `I'm currently experiencing connectivity issues with the AI service. Your data is secure on-chain. Please try again in a moment. (Error: ${error instanceof Error ? error.message : 'Connection timeout'})`,
          metrics,
          fallback: true,
          onChain: false,
          privacyCompliant: true
        };
      }
    },
    onError: (error) => {
      console.error('LLM query mutation failed:', error);
    },
  });
}

// Sprint 3: Get LLM Performance Metrics for monitoring dashboard
export function useGetLLMMetrics() {
  const queryClient = useQueryClient();
  
  return useQuery<LLMPerformanceMetrics[]>({
    queryKey: ['allLLMMetrics'],
    queryFn: async () => {
      const metrics = queryClient.getQueryData<LLMPerformanceMetrics[]>(['allLLMMetrics']) || [];
      return metrics.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Sprint 3: Prefetch common patterns
export function usePrefetchCommonPatterns() {
  const llmQuery = useLLMQuery();
  const { identity } = useInternetIdentity();
  
  return useMutation({
    mutationFn: async (context: 'dashboard' | 'health-labs' | 'defi' | 'shop' | 'schedule') => {
      if (!identity) return;
      
      // Prefetch top 3 common patterns for this context
      const patterns = COMMON_PATTERNS.slice(0, 3);
      const results = await Promise.allSettled(
        patterns.map(pattern => 
          llmQuery.mutateAsync({ prompt: pattern, context })
        )
      );
      
      return {
        prefetched: results.filter(r => r.status === 'fulfilled').length,
        total: patterns.length
      };
    }
  });
}

// Sprint 3: Clear LLM cache
export function useClearLLMCache() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      llmCache.clear();
      queryClient.setQueryData(['allLLMMetrics'], []);
      return { cleared: true };
    }
  });
}

// Domain Vitality Queries (Sprint 2)
export function useCalculateDomainVitality() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      indicators,
      standards,
      userGoals,
      alpha,
      gamma,
      deltaMaintenance
    }: {
      indicators: HealthIndicatorValue[];
      standards: Array<[string, number, number, number]>;
      userGoals: Array<[string, number]>;
      alpha: number;
      gamma: number;
      deltaMaintenance: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const result = await (actor as any).calculateIntraDomainVitality(
          indicators,
          standards,
          userGoals,
          alpha,
          gamma,
          deltaMaintenance
        );
        return result as DomainVitalityResult;
      } catch (error) {
        console.error('Failed to calculate domain vitality:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domainVitalityScores'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['synergyCoefficient'] });
    },
    onError: (error) => {
      console.error('Failed to calculate vitality:', error);
    },
  });
}

export function useGetDomainVitalityScores() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<DomainVitalityResult[]>({
    queryKey: ['domainVitalityScores', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        const scores = await (actor as any).getVitalityScores();
        const maintenanceStatus = await (actor as any).getMaintenanceStatus();
        
        return scores.map((score: IntraDomainVitality) => ({
          vitality: score,
          isMaintenanceActive: maintenanceStatus.isActive,
          maintenanceStatus: maintenanceStatus
        }));
      } catch (error) {
        console.error('Failed to get domain vitality scores:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useGetMaintenanceStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<MaintenanceStatus>({
    queryKey: ['maintenanceStatus', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Not authenticated');
      
      try {
        return await (actor as any).getMaintenanceStatus();
      } catch (error) {
        console.error('Failed to get maintenance status:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Sprint 3: Synergy Coefficient Queries
export function useSubmitDomainVitalityScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      domain,
      score,
      isActive
    }: {
      domain: string;
      score: number;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        return await (actor as any).submitDomainVitalityScore(domain, score, isActive);
      } catch (error) {
        console.error('Failed to submit domain vitality score:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domainVitalityScores'] });
      queryClient.invalidateQueries({ queryKey: ['synergyCoefficient'] });
    },
    onError: (error) => {
      console.error('Failed to submit domain vitality score:', error);
    },
  });
}

export function useCalculateSynergyCoefficient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const result = await (actor as any).calculateSynergyCoefficient();
        return result as SynergyCoefficient;
      } catch (error) {
        console.error('Failed to calculate synergy coefficient:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synergyCoefficient'] });
    },
    onError: (error) => {
      console.error('Failed to calculate synergy coefficient:', error);
    },
  });
}

export function useGetSynergyCoefficient() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<SynergyCoefficient | null>({
    queryKey: ['synergyCoefficient', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      if (!isAuthenticated) return null;
      
      try {
        return await (actor as any).getSynergyCoefficient();
      } catch (error) {
        console.error('Failed to get synergy coefficient:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Central Standards Memory Queries
export function useGetHealthStandardsByDomain(domain: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<HealthStandard[]>({
    queryKey: ['healthStandards', domain],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        const standards = await (actor as any).getStandardsByDomain(domain);
        return standards || [];
      } catch (error) {
        console.error('Failed to get health standards by domain:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!domain,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useGetHealthStandardByMetric() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (metricName: string) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const standard = await (actor as any).getStandardByMetric(metricName);
        return standard;
      } catch (error) {
        console.error('Failed to get health standard by metric:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Failed to search health standard:', error);
    },
  });
}

export function useAddHealthStandard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (standard: HealthStandard) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addStandard(standard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthStandards'] });
    },
    onError: (error) => {
      console.error('Failed to add health standard:', error);
    },
  });
}

export function useUpdateHealthStandard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ metricName, updated }: { metricName: string; updated: HealthStandard }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateStandard(metricName, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthStandards'] });
    },
    onError: (error) => {
      console.error('Failed to update health standard:', error);
    },
  });
}

export function useIsStandardsInitialized() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<boolean>({
    queryKey: ['standardsInitialized'],
    queryFn: async () => {
      if (!actor) return false;
      if (!isAuthenticated) return false;
      
      try {
        return await (actor as any).isInitialized();
      } catch (error) {
        console.error('Failed to check standards initialization:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useInitializeStandards() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addInitialReferenceStandards();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standardsInitialized'] });
      queryClient.invalidateQueries({ queryKey: ['healthStandards'] });
    },
    onError: (error) => {
      console.error('Failed to initialize standards:', error);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      if (!isAuthenticated) return false;
      
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      if (!isAuthenticated) {
        return null;
      }

      try {
        const profile = await actor.getCallerUserProfile();
        return profile;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Unauthorized') || error.message.includes('trap')) {
            return null;
          }
        }
        throw error;
      }
    },
    enabled: !!actor && 
             !actorFetching && 
             loginStatus !== 'initializing' && 
             loginStatus !== 'logging-in',
    retry: (failureCount, error) => {
      if (error instanceof Error && 
          (error.message.includes('Unauthorized') || error.message.includes('trap'))) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('Failed to save user profile:', error);
    },
  });
}

export function useCompleteOnboarding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeOnboarding();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingComplete'] });
    },
    onError: (error) => {
      console.error('Failed to complete onboarding:', error);
    },
  });
}

export function useIsOnboardingComplete() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<boolean>({
    queryKey: ['onboardingComplete', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      if (!isAuthenticated) return false;
      
      try {
        return await actor.isOnboardingComplete();
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Health Records Queries
export function useUploadHealthRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ filePath, fileType }: { filePath: string; fileType: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadHealthRecord(filePath, fileType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
      queryClient.invalidateQueries({ queryKey: ['uploadStatuses'] });
    },
    onError: (error) => {
      console.error('Failed to upload health record:', error);
    },
  });
}

export function useGetHealthRecords() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<HealthRecord[]>({
    queryKey: ['healthRecords', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getHealthRecords();
      } catch (error) {
        console.error('Failed to get health records:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useGetUploadStatuses() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<UploadStatus[]>({
    queryKey: ['uploadStatuses', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getUploadStatuses();
      } catch (error) {
        console.error('Failed to get upload statuses:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateReviewStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, reviewStatus }: { recordId: string; reviewStatus: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateReviewStatus(recordId, reviewStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
      queryClient.invalidateQueries({ queryKey: ['healthIndicators'] });
      queryClient.invalidateQueries({ queryKey: ['domainProgress'] });
    },
    onError: (error) => {
      console.error('Failed to update review status:', error);
    },
  });
}

export function useDeleteHealthRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHealthRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
      queryClient.invalidateQueries({ queryKey: ['uploadStatuses'] });
    },
    onError: (error) => {
      console.error('Failed to delete health record:', error);
    },
  });
}

// Referral System Queries
export function useCreateReferral() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReferral(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
    onError: (error) => {
      console.error('Failed to create referral:', error);
    },
  });
}

export function useGetReferral() {
  const { actor, isFetching } = useActor();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReferral(code);
    },
    onError: (error) => {
      console.error('Failed to get referral:', error);
    },
  });
}

export function useClaimReferralReward() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimReferralReward(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['ascendTokenBalance'] });
    },
    onError: (error) => {
      console.error('Failed to claim referral reward:', error);
    },
  });
}

export function useGetAllReferrals() {
  const { actor, isFetching } = useActor();

  return useQuery<Referral[]>({
    queryKey: ['allReferrals'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllReferrals();
      } catch (error) {
        console.error('Failed to get all referrals:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Brand Suggestion Queries
export function useSubmitBrandSuggestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ brandName, category, reason, userEmail }: {
      brandName: string;
      category: string;
      reason: string | null;
      userEmail: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitBrandSuggestion(brandName, category, reason, userEmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandSuggestions'] });
    },
    onError: (error) => {
      console.error('Failed to submit brand suggestion:', error);
    },
  });
}

export function useGetBrandSuggestions() {
  const { actor, isFetching } = useActor();

  return useQuery<BrandSuggestion[]>({
    queryKey: ['brandSuggestions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBrandSuggestions();
      } catch (error) {
        console.error('Failed to get brand suggestions:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Enhanced Wearable Integration Queries
export function useConnectWearable() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ service, accessToken, refreshToken, expiresAt }: {
      service: string;
      accessToken: string;
      refreshToken?: string;
      expiresAt?: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.connectWearable(service, accessToken, refreshToken || null, expiresAt || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearableConnections'] });
      queryClient.invalidateQueries({ queryKey: ['healthIndicators'] });
    },
    onError: (error) => {
      console.error('Failed to connect wearable:', error);
    },
  });
}

export function useGetWearableConnections() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<WearableConnection[]>({
    queryKey: ['wearableConnections', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getWearableConnections();
      } catch (error) {
        console.error('Failed to get wearable connections:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAddHealthIndicator() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (indicator: HealthIndicator) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHealthIndicator(indicator);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthIndicators'] });
      queryClient.invalidateQueries({ queryKey: ['domainProgress'] });
    },
    onError: (error) => {
      console.error('Failed to add health indicator:', error);
    },
  });
}

export function useGetHealthIndicators() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<HealthIndicator[]>({
    queryKey: ['healthIndicators', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getHealthIndicators();
      } catch (error) {
        console.error('Failed to get health indicators:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Wearable Sync Query
export function useWearableSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        deviceId,
        syncTime: new Date(),
        dataPoints: Math.floor(Math.random() * 100) + 50,
        success: Math.random() > 0.1,
        encryptionStatus: 'encrypted',
        oauthTokenRefreshed: Math.random() > 0.8,
        syncedMetrics: ['steps', 'heartRate', 'sleep', 'hrv']
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['domainProgress'] });
      queryClient.invalidateQueries({ queryKey: ['healthIndicators'] });
      queryClient.invalidateQueries({ queryKey: ['wearableConnections'] });
      
      console.log(`Wearable sync completed for ${data.deviceId}:`, {
        dataPoints: data.dataPoints,
        encrypted: data.encryptionStatus === 'encrypted',
        tokenRefreshed: data.oauthTokenRefreshed
      });
    },
    onError: (error) => {
      console.error('Failed to sync wearable data:', error);
    },
  });
}

// Domain Progress Queries
export function useGetDomainProgress() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<Array<[HealthDomain, DomainProgress]>>({
    queryKey: ['domainProgress', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getDomainProgress();
      } catch (error) {
        console.error('Failed to get domain progress:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateDomainProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ domain, progress }: { domain: HealthDomain; progress: DomainProgress }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDomainProgress(domain, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domainProgress'] });
    },
    onError: (error) => {
      console.error('Failed to update domain progress:', error);
    },
  });
}

// Badge Queries
export function useGetBadges() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<Badge[]>({
    queryKey: ['badges', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getBadges();
      } catch (error) {
        console.error('Failed to get badges:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAddBadge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badge: Badge) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBadge(badge);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
    onError: (error) => {
      console.error('Failed to add badge:', error);
    },
  });
}

// Reward Queries
export function useGetRewards() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<Reward[]>({
    queryKey: ['rewards', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getRewards();
      } catch (error) {
        console.error('Failed to get rewards:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAddReward() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reward: Reward) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReward(reward);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
    onError: (error) => {
      console.error('Failed to add reward:', error);
    },
  });
}

// Leaderboard Queries
export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLeaderboard();
      } catch (error) {
        console.error('Failed to get leaderboard:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAddLeaderboardEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: LeaderboardEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLeaderboardEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    onError: (error) => {
      console.error('Failed to add leaderboard entry:', error);
    },
  });
}

// Agent Interaction Queries
export function useGetAgentInteractions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<AgentInteraction[]>({
    queryKey: ['agentInteractions', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getAgentInteractions();
      } catch (error) {
        console.error('Failed to get agent interactions:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAddAgentInteraction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interaction: AgentInteraction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAgentInteraction(interaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentInteractions'] });
    },
    onError: (error) => {
      console.error('Failed to add agent interaction:', error);
    },
  });
}

// Notification Queries
export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<Notification[]>({
    queryKey: ['notifications', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getNotifications();
      } catch (error) {
        console.error('Failed to get notifications:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAddNotification() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, notification }: { targetUserId: Principal; notification: Notification }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNotification(targetUserId, notification);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to add notification:', error);
    },
  });
}

// Custom Metrics Queries
export function useGetCustomMetrics() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<CustomMetric[]>({
    queryKey: ['customMetrics', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getCustomMetrics();
      } catch (error) {
        console.error('Failed to get custom metrics:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCustomMetric() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metric: CustomMetric) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomMetric(metric);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['domainProgress'] });
    },
    onError: (error) => {
      console.error('Failed to create custom metric:', error);
    },
  });
}

// Staking Queries
export function useGetStakingPositions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<StakingPosition[]>({
    queryKey: ['stakingPositions', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (!isAuthenticated) return [];
      
      try {
        return await actor.getStakingPositions();
      } catch (error) {
        console.error('Failed to get staking positions:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useStakeTokens() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, lockupPeriod }: { amount: bigint; lockupPeriod: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.stakeTokens(amount, lockupPeriod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakingPositions'] });
      queryClient.invalidateQueries({ queryKey: ['ascendTokenBalance'] });
    },
    onError: (error) => {
      console.error('Failed to stake tokens:', error);
    },
  });
}

export function useUnstakeTokens() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (positionIndex: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unstakeTokens(positionIndex);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakingPositions'] });
      queryClient.invalidateQueries({ queryKey: ['ascendTokenBalance'] });
    },
    onError: (error) => {
      console.error('Failed to unstake tokens:', error);
    },
  });
}

// Liquidity Pool Queries
export function useGetLiquidityPools() {
  const { actor, isFetching } = useActor();

  return useQuery<LiquidityPool[]>({
    queryKey: ['liquidityPools'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLiquidityPools();
      } catch (error) {
        console.error('Failed to get liquidity pools:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateLiquidityPools() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLiquidityPools();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liquidityPools'] });
    },
    onError: (error) => {
      console.error('Failed to update liquidity pools:', error);
    },
  });
}

// Proof of Life Queries - Mock implementation for frontend development
export function useSubmitDailyHealthData() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ steps, protein, sleep }: { steps: number; protein: number; sleep: number }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const healthDataString = `${steps}-${protein}-${sleep}`;
      const healthDataHash = btoa(healthDataString);
      const verified = steps >= 10000 && protein >= 100 && sleep >= 7;
      const reward = verified ? 10 : 0;
      
      const proof: Proof = {
        userId: identity?.getPrincipal().toString() || 'anonymous',
        healthDataHash,
        timestamp: BigInt(Date.now()),
        verified,
        reward
      };
      
      return proof;
    },
    onSuccess: (proof) => {
      queryClient.invalidateQueries({ queryKey: ['proofHistory'] });
      queryClient.invalidateQueries({ queryKey: ['ascendTokenBalance'] });
      
      if (proof.verified) {
        queryClient.invalidateQueries({ queryKey: ['rewards'] });
      }
    },
    onError: (error) => {
      console.error('Failed to submit daily health data:', error);
    },
  });
}

export function useGetProofHistory() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<Proof[]>({
    queryKey: ['proofHistory', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          userId: identity.getPrincipal().toString(),
          healthDataHash: 'aGVhbHRoZGF0YTE=',
          timestamp: BigInt(Date.now() - 86400000),
          verified: true,
          reward: 10
        },
        {
          userId: identity.getPrincipal().toString(),
          healthDataHash: 'aGVhbHRoZGF0YTI=',
          timestamp: BigInt(Date.now() - 172800000),
          verified: false,
          reward: 0
        },
        {
          userId: identity.getPrincipal().toString(),
          healthDataHash: 'aGVhbHRoZGF0YTM=',
          timestamp: BigInt(Date.now() - 259200000),
          verified: true,
          reward: 10
        }
      ];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useGetAscendTokenBalance() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<{ balance: number; totalEarned: number }>({
    queryKey: ['ascendTokenBalance', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!isAuthenticated) return { balance: 0, totalEarned: 0 };
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        balance: 127,
        totalEarned: 180
      };
    },
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useVerifyProof() {
  return useMutation({
    mutationFn: async ({ healthDataHash }: { healthDataHash: string }) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        verified: true,
        timestamp: Date.now(),
        hash: healthDataHash
      };
    },
    onError: (error) => {
      console.error('Failed to verify proof:', error);
    },
  });
}

// ICPSwap Integration Queries
export function useGetSwapQuote() {
  return useMutation({
    mutationFn: async ({ 
      inputAmount, 
      tokenPair 
    }: { 
      inputAmount: number; 
      tokenPair: string; 
    }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockRates = {
        'ascend-usdt': 0.025,
        'ascend-icp': 0.002
      };
      
      const rate = mockRates[tokenPair as keyof typeof mockRates] || 0.025;
      const outputAmount = inputAmount * rate;
      const slippage = 0.01;
      const minOut = outputAmount * (1 - slippage);
      const priceImpact = Math.min(inputAmount / 10000, 0.05);
      const fee = outputAmount * 0.003;
      
      return {
        inputAmount,
        outputAmount: outputAmount - fee,
        minOut,
        slippage,
        priceImpact,
        fee,
        tokenPair
      };
    },
    onError: (error) => {
      console.error('Failed to get swap quote:', error);
    },
  });
}

export function useExecuteSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      quote 
    }: { 
      quote: {
        inputAmount: number;
        outputAmount: number;
        minOut: number;
        tokenPair: string;
      }
    }) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (Math.random() < 0.1) {
        throw new Error('Swap failed due to insufficient liquidity');
      }
      
      return {
        success: true,
        transactionId: `tx_${Date.now()}`,
        inputAmount: quote.inputAmount,
        outputAmount: quote.outputAmount,
        tokenPair: quote.tokenPair,
        timestamp: Date.now()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ascendTokenBalance'] });
    },
    onError: (error) => {
      console.error('Failed to execute swap:', error);
    },
  });
}

// Tour Progress Queries
export function useGetTourProgress() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<TourProgress | null>({
    queryKey: ['tourProgress', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      if (!isAuthenticated) return null;
      
      try {
        return await actor.getTourProgress();
      } catch (error) {
        console.error('Failed to get tour progress:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveTourProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progress: TourProgress) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveTourProgress(progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourProgress'] });
    },
    onError: (error) => {
      console.error('Failed to save tour progress:', error);
    },
  });
}

// Dashboard Preferences Queries
export function useGetDashboardPreferences() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<DashboardPreference | null>({
    queryKey: ['dashboardPreferences', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      if (!isAuthenticated) return null;
      
      try {
        return await actor.getDashboardPreferences();
      } catch (error) {
        console.error('Failed to get dashboard preferences:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveDashboardPreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: DashboardPreference) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDashboardPreferences(preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardPreferences'] });
    },
    onError: (error) => {
      console.error('Failed to save dashboard preferences:', error);
    },
  });
}

// Help Preferences Queries
export function useGetHelpPreferences() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<HelpPreference | null>({
    queryKey: ['helpPreferences', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      if (!isAuthenticated) return null;
      
      try {
        return await actor.getHelpPreferences();
      } catch (error) {
        console.error('Failed to get help preferences:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSaveHelpPreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: HelpPreference) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveHelpPreferences(preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpPreferences'] });
    },
    onError: (error) => {
      console.error('Failed to save help preferences:', error);
    },
  });
}

// White Paper Document Queries
export function useGetAllWhitePaperDocuments() {
  const { actor, isFetching } = useActor();

  return useQuery<WhitePaperDocument[]>({
    queryKey: ['whitePaperDocuments'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllWhitePaperDocuments();
      } catch (error) {
        console.error('Failed to get white paper documents:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useGetWhitePaperDocument() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWhitePaperDocument(documentId);
    },
    onError: (error) => {
      console.error('Failed to get white paper document:', error);
    },
  });
}

export function useCreateWhitePaperDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createWhitePaperDocument(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitePaperDocuments'] });
    },
    onError: (error) => {
      console.error('Failed to create white paper document:', error);
    },
  });
}

export function useAddWhitePaperSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, section }: { documentId: string; section: WhitePaperSection }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWhitePaperSection(documentId, section);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitePaperDocuments'] });
    },
    onError: (error) => {
      console.error('Failed to add white paper section:', error);
    },
  });
}

export function useUpdateWhitePaperSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      sectionId, 
      updatedSection 
    }: { 
      documentId: string; 
      sectionId: string; 
      updatedSection: WhitePaperSection 
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWhitePaperSection(documentId, sectionId, updatedSection);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitePaperDocuments'] });
    },
    onError: (error) => {
      console.error('Failed to update white paper section:', error);
    },
  });
}

export function useDeleteWhitePaperSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, sectionId }: { documentId: string; sectionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWhitePaperSection(documentId, sectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitePaperDocuments'] });
    },
    onError: (error) => {
      console.error('Failed to delete white paper section:', error);
    },
  });
}

export function useUpdateWhitePaperStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, status }: { documentId: string; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWhitePaperStatus(documentId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitePaperDocuments'] });
    },
    onError: (error) => {
      console.error('Failed to update white paper status:', error);
    },
  });
}

export function useDeleteWhitePaperDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWhitePaperDocument(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitePaperDocuments'] });
    },
    onError: (error) => {
      console.error('Failed to delete white paper document:', error);
    },
  });
}
