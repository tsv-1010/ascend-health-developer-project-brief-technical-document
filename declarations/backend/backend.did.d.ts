import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AgentInteraction {
  'message' : string,
  'response' : string,
  'timestamp' : Time,
}
export interface Badge {
  'id' : string,
  'dateEarned' : Time,
  'name' : string,
  'description' : string,
}
export interface BrandSuggestion {
  'userEmail' : string,
  'timestamp' : Time,
  'category' : string,
  'brandName' : string,
  'reviewed' : boolean,
  'reason' : [] | [string],
}
export interface CheckoutSession {
  'id' : string,
  'status' : string,
  'paymentMethod' : string,
  'cart' : Array<Product>,
  'userId' : Principal,
  'createdAt' : Time,
  'updatedAt' : Time,
  'totalAmount' : bigint,
}
export interface CustomMetric {
  'id' : string,
  'domain' : HealthDomain,
  'value' : bigint,
  'name' : string,
  'createdAt' : Time,
}
export interface DashboardPreference {
  'notificationPreferences' : Array<string>,
  'hiddenCards' : Array<string>,
  'userId' : Principal,
  'lastUpdated' : Time,
  'cardOrder' : Array<string>,
}
export interface DomainProgress {
  'streak' : bigint,
  'lastUpdated' : Time,
  'score' : bigint,
}
export interface ExtractedField {
  'domain' : string,
  'value' : string,
  'source' : string,
  'indicator' : string,
  'confidence' : bigint,
  'fieldName' : string,
}
export interface FileReference { 'hash' : string, 'path' : string }
export type HealthDomain = { 'mental' : null } |
  { 'longevity' : null } |
  { 'community' : null } |
  { 'fitness' : null } |
  { 'environment' : null } |
  { 'purpose' : null } |
  { 'nutrition' : null } |
  { 'finances' : null };
export interface HealthIndicator {
  'value' : bigint,
  'source' : string,
  'name' : string,
  'unit' : string,
  'timestamp' : Time,
}
export interface HealthRecord {
  'id' : string,
  'status' : string,
  'userId' : Principal,
  'filePath' : string,
  'extractedData' : [] | [Array<ExtractedField>],
  'reviewStatus' : string,
  'fileType' : string,
  'uploadTime' : Time,
}
export interface HelpPreference {
  'userId' : Principal,
  'lastUpdated' : Time,
  'showHelp' : boolean,
  'completedTutorials' : Array<string>,
}
export interface LeaderboardEntry {
  'domain' : HealthDomain,
  'userId' : string,
  'score' : bigint,
}
export interface LiquidityPool {
  'id' : string,
  'apy' : bigint,
  'totalLiquidity' : bigint,
  'volume' : bigint,
  'tokenPair' : string,
}
export interface Notification {
  'id' : string,
  'read' : boolean,
  'type' : string,
  'message' : string,
  'dateSent' : Time,
}
export interface PaymentTransaction {
  'id' : string,
  'status' : string,
  'paymentMethod' : string,
  'userId' : Principal,
  'errorMessage' : [] | [string],
  'vendor' : string,
  'timestamp' : Time,
  'amount' : bigint,
}
export interface Product {
  'id' : string,
  'protocol' : string,
  'name' : string,
  'recommended' : boolean,
  'description' : string,
  'aiInfo' : string,
  'vendor' : string,
  'category' : string,
  'price' : bigint,
  'ranking' : bigint,
}
export interface PromptSuggestion {
  'id' : string,
  'context' : string,
  'usageCount' : bigint,
  'prompt' : string,
  'lastUsed' : Time,
}
export interface QuickAction {
  'id' : string,
  'action' : string,
  'context' : string,
  'usageCount' : bigint,
  'lastUsed' : Time,
}
export interface Referral {
  'referrer' : Principal,
  'rewardClaimed' : boolean,
  'code' : string,
  'timestamp' : Time,
  'referee' : [] | [Principal],
}
export interface Reward {
  'id' : string,
  'type' : string,
  'dateAwarded' : Time,
  'amount' : bigint,
}
export interface StakingPosition {
  'startTime' : Time,
  'active' : boolean,
  'userId' : Principal,
  'amount' : bigint,
  'lockupPeriod' : bigint,
  'rewardMultiplier' : bigint,
}
export type Time = bigint;
export interface TourProgress {
  'userId' : Principal,
  'completed' : boolean,
  'lastUpdated' : Time,
  'steps' : Array<TourStep>,
}
export interface TourStep {
  'id' : string,
  'title' : string,
  'order' : bigint,
  'completed' : boolean,
  'description' : string,
  'target' : string,
}
export interface TransformationInput {
  'context' : Uint8Array | number[],
  'response' : http_request_result,
}
export interface TransformationOutput {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<http_header>,
}
export interface UploadStatus {
  'id' : string,
  'status' : string,
  'userId' : Principal,
  'errorMessage' : [] | [string],
  'filePath' : string,
  'progress' : bigint,
  'timestamp' : Time,
}
export interface UserProfile {
  'age' : bigint,
  'name' : string,
  'onboardingComplete' : boolean,
  'agentName' : string,
  'subscriptionStatus' : boolean,
  'goals' : Array<string>,
  'healthConcerns' : Array<string>,
  'privacyConsent' : boolean,
}
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface WearableConnection {
  'service' : string,
  'expiresAt' : [] | [Time],
  'refreshToken' : [] | [string],
  'connectedAt' : Time,
  'accessToken' : string,
}
export interface http_header { 'value' : string, 'name' : string }
export interface http_request_result {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<http_header>,
}
export interface _SERVICE {
  'addAgentInteraction' : ActorMethod<[AgentInteraction], undefined>,
  'addBadge' : ActorMethod<[Badge], undefined>,
  'addExtractedData' : ActorMethod<[string, Array<ExtractedField>], undefined>,
  'addHealthIndicator' : ActorMethod<[HealthIndicator], undefined>,
  'addLeaderboardEntry' : ActorMethod<[LeaderboardEntry], undefined>,
  'addNotification' : ActorMethod<[Notification], undefined>,
  'addProduct' : ActorMethod<[Product], undefined>,
  'addReward' : ActorMethod<[Reward], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'claimReferralReward' : ActorMethod<[string], undefined>,
  'completeOnboarding' : ActorMethod<[], undefined>,
  'connectWearable' : ActorMethod<
    [string, string, [] | [string], [] | [Time]],
    undefined
  >,
  'createCheckoutSession' : ActorMethod<
    [Array<Product>, bigint, string],
    string
  >,
  'createCustomMetric' : ActorMethod<[CustomMetric], undefined>,
  'createReferral' : ActorMethod<[string], undefined>,
  'deleteCheckoutSession' : ActorMethod<[string], undefined>,
  'deleteHealthRecord' : ActorMethod<[string], undefined>,
  'deletePaymentTransaction' : ActorMethod<[string], undefined>,
  'deleteProduct' : ActorMethod<[string], undefined>,
  'deleteUploadStatus' : ActorMethod<[string], undefined>,
  'dropFileReference' : ActorMethod<[string], undefined>,
  'getAgentInteractions' : ActorMethod<[], Array<AgentInteraction>>,
  'getAllReferrals' : ActorMethod<[], Array<Referral>>,
  'getBadges' : ActorMethod<[], Array<Badge>>,
  'getBrandSuggestions' : ActorMethod<[], Array<BrandSuggestion>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCheckoutSessionById' : ActorMethod<[string], [] | [CheckoutSession]>,
  'getCheckoutSessions' : ActorMethod<[], Array<CheckoutSession>>,
  'getCustomMetrics' : ActorMethod<[], Array<CustomMetric>>,
  'getDashboardPreferences' : ActorMethod<[], [] | [DashboardPreference]>,
  'getDomainProgress' : ActorMethod<[], Array<[HealthDomain, DomainProgress]>>,
  'getFileReference' : ActorMethod<[string], FileReference>,
  'getHealthIndicators' : ActorMethod<[], Array<HealthIndicator>>,
  'getHealthRecordById' : ActorMethod<[string], [] | [HealthRecord]>,
  'getHealthRecords' : ActorMethod<[], Array<HealthRecord>>,
  'getHelpPreferences' : ActorMethod<[], [] | [HelpPreference]>,
  'getLeaderboard' : ActorMethod<[], Array<LeaderboardEntry>>,
  'getLiquidityPools' : ActorMethod<[], Array<LiquidityPool>>,
  'getNotifications' : ActorMethod<[], Array<Notification>>,
  'getPaymentTransactionById' : ActorMethod<
    [string],
    [] | [PaymentTransaction]
  >,
  'getPaymentTransactions' : ActorMethod<[], Array<PaymentTransaction>>,
  'getProductById' : ActorMethod<[string], [] | [Product]>,
  'getProducts' : ActorMethod<[], Array<Product>>,
  'getPromptSuggestions' : ActorMethod<[], Array<PromptSuggestion>>,
  'getQuickActions' : ActorMethod<[], Array<QuickAction>>,
  'getReferral' : ActorMethod<[string], [] | [Referral]>,
  'getRewards' : ActorMethod<[], Array<Reward>>,
  'getStakingPositions' : ActorMethod<[], Array<StakingPosition>>,
  'getTourProgress' : ActorMethod<[], [] | [TourProgress]>,
  'getUploadStatusById' : ActorMethod<[string], [] | [UploadStatus]>,
  'getUploadStatuses' : ActorMethod<[], Array<UploadStatus>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getWearableConnections' : ActorMethod<[], Array<WearableConnection>>,
  'initializeAccessControl' : ActorMethod<[], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'isOnboardingComplete' : ActorMethod<[], boolean>,
  'listFileReferences' : ActorMethod<[], Array<FileReference>>,
  'processPayment' : ActorMethod<[bigint, string, string], string>,
  'registerFileReference' : ActorMethod<[string, string], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'saveDashboardPreferences' : ActorMethod<[DashboardPreference], undefined>,
  'saveHelpPreferences' : ActorMethod<[HelpPreference], undefined>,
  'savePromptSuggestions' : ActorMethod<[Array<PromptSuggestion>], undefined>,
  'saveQuickActions' : ActorMethod<[Array<QuickAction>], undefined>,
  'saveTourProgress' : ActorMethod<[TourProgress], undefined>,
  'stakeTokens' : ActorMethod<[bigint, bigint], undefined>,
  'submitBrandSuggestion' : ActorMethod<
    [string, string, [] | [string], string],
    undefined
  >,
  'transform' : ActorMethod<[TransformationInput], TransformationOutput>,
  'unstakeTokens' : ActorMethod<[bigint], undefined>,
  'updateCheckoutSession' : ActorMethod<[string, CheckoutSession], undefined>,
  'updateDomainProgress' : ActorMethod<
    [HealthDomain, DomainProgress],
    undefined
  >,
  'updateLiquidityPools' : ActorMethod<[], undefined>,
  'updatePaymentTransaction' : ActorMethod<
    [string, PaymentTransaction],
    undefined
  >,
  'updateProduct' : ActorMethod<[string, Product], undefined>,
  'updateReviewStatus' : ActorMethod<[string, string], undefined>,
  'updateUploadStatus' : ActorMethod<
    [string, string, bigint, [] | [string]],
    undefined
  >,
  'uploadHealthRecord' : ActorMethod<[string, string], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
