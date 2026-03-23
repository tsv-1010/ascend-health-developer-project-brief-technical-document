import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransparencyLog {
    id: string;
    status: string;
    action: string;
    userId: Principal;
    dataHash: string;
    timestamp: Time;
}
export interface LeaderboardEntry {
    domain: HealthDomain;
    userId: string;
    score: bigint;
}
export interface AnalyticsAggregate {
    id: string;
    value: bigint;
    timestamp: Time;
    metricType: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface DashboardPreference {
    notificationPreferences: Array<string>;
    hiddenCards: Array<string>;
    userId: Principal;
    lastUpdated: Time;
    cardOrder: Array<string>;
}
export interface GrantKPI {
    id: string;
    value: bigint;
    period: string;
    timestamp: Time;
    metricName: string;
}
export interface CoachingSession {
    effectiveness: bigint;
    userResponse?: string;
    userId: Principal;
    recommendations: Array<string>;
    timestamp: Time;
    sessionId: string;
}
export interface WhitePaperDocument {
    id: string;
    status: string;
    title: string;
    createdAt: Time;
    version: bigint;
    updatedAt: Time;
    sections: Array<WhitePaperSection>;
}
export interface PerformanceMetric {
    id: string;
    value: bigint;
    canister: string;
    timestamp: Time;
    metricType: string;
}
export interface PaymentTransaction {
    id: string;
    status: string;
    paymentMethod: string;
    userId: Principal;
    errorMessage?: string;
    vendor: string;
    timestamp: Time;
    amount: bigint;
}
export interface BrandSuggestion {
    userEmail: string;
    timestamp: Time;
    category: string;
    brandName: string;
    reviewed: boolean;
    reason?: string;
}
export interface Badge {
    id: string;
    dateEarned: Time;
    name: string;
    description: string;
}
export interface PromptSuggestion {
    id: string;
    context: string;
    usageCount: bigint;
    prompt: string;
    lastUsed: Time;
}
export interface CustomMetric {
    id: string;
    domain: HealthDomain;
    value: bigint;
    name: string;
    createdAt: Time;
}
export interface LiquidityPool {
    id: string;
    apy: bigint;
    totalLiquidity: bigint;
    volume: bigint;
    tokenPair: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface WearableConnection {
    service: string;
    expiresAt?: Time;
    refreshToken?: string;
    connectedAt: Time;
    accessToken: string;
}
export interface Referral {
    referrer: Principal;
    rewardClaimed: boolean;
    code: string;
    timestamp: Time;
    referee?: Principal;
}
export interface ProtocolProgress {
    currentMetrics: Array<[string, bigint]>;
    userId: Principal;
    lastUpdated: Time;
    protocolId: string;
    completedActions: Array<string>;
    milestones: Array<[string, boolean]>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface ProfessionalAccessToken {
    permissions: Array<string>;
    active: boolean;
    tokenId: string;
    expiresAt: Time;
    userId: Principal;
    createdAt: Time;
    professionalId: Principal;
}
export interface HelpPreference {
    userId: Principal;
    lastUpdated: Time;
    showHelp: boolean;
    completedTutorials: Array<string>;
}
export interface TourStep {
    id: string;
    title: string;
    order: bigint;
    completed: boolean;
    description: string;
    target: string;
}
export interface HealthProtocol {
    id: string;
    status: string;
    timeframe: bigint;
    metrics: Array<[string, bigint]>;
    userId: Principal;
    name: string;
    createdAt: Time;
    createdBy: Principal;
    actions: Array<string>;
    version: bigint;
    goals: Array<string>;
}
export interface FileReference {
    hash: string;
    path: string;
}
export interface ZKProof {
    id: string;
    verified: boolean;
    proofData: string;
    userId: Principal;
    timestamp: Time;
}
export interface ExtractedField {
    domain: string;
    value: string;
    source: string;
    indicator: string;
    confidence: bigint;
    fieldName: string;
}
export interface WhitePaperSection {
    id: string;
    title: string;
    content: string;
    order: bigint;
    lastUpdated: Time;
}
export interface Reward {
    id: string;
    type: string;
    dateAwarded: Time;
    amount: bigint;
}
export interface UploadStatus {
    id: string;
    status: string;
    userId: Principal;
    errorMessage?: string;
    filePath: string;
    progress: bigint;
    timestamp: Time;
}
export interface QuickAction {
    id: string;
    action: string;
    context: string;
    usageCount: bigint;
    lastUsed: Time;
}
export interface DomainAgent {
    insights: Array<string>;
    active: boolean;
    domain: HealthDomain;
    userId: Principal;
    recommendations: Array<string>;
    lastCheck: Time;
}
export interface ScheduledNotification {
    id: string;
    status: string;
    scheduledTime: Time;
    userId: Principal;
    createdAt: Time;
    message: string;
    sentimentIntensity: string;
}
export interface HealthRecord {
    id: string;
    status: string;
    userId: Principal;
    filePath: string;
    extractedData?: Array<ExtractedField>;
    reviewStatus: string;
    fileType: string;
    uploadTime: Time;
}
export interface CommunityProposal {
    id: string;
    status: string;
    title: string;
    votes: bigint;
    createdAt: Time;
    description: string;
    proposer: Principal;
}
export interface CheckoutSession {
    id: string;
    status: string;
    paymentMethod: string;
    cart: Array<Product>;
    userId: Principal;
    createdAt: Time;
    updatedAt: Time;
    totalAmount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StakingPosition {
    startTime: Time;
    active: boolean;
    userId: Principal;
    amount: bigint;
    lockupPeriod: bigint;
    rewardMultiplier: bigint;
}
export interface NotificationPreference {
    enabledTypes: Array<string>;
    userId: Principal;
    quietHours: Array<[bigint, bigint]>;
    tone: string;
    lastUpdated: Time;
    frequency: string;
}
export interface AgentInteraction {
    message: string;
    response: string;
    timestamp: Time;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface AIMemoryProfile {
    userId: Principal;
    lastUpdated: Time;
    preferences: Array<[string, string]>;
    toneVectors: Array<[string, bigint]>;
    goalPriorities: Array<string>;
    healthStats: Array<[string, bigint]>;
    communicationStyle: string;
    interactionHistory: Array<string>;
}
export interface SystemMetric {
    id: string;
    cycleUsage: bigint;
    userEngagement: bigint;
    timestamp: Time;
    aiProcessingTime: bigint;
    proofsPerDay: bigint;
    stakingTotals: bigint;
}
export interface Notification {
    id: string;
    read: boolean;
    type: string;
    message: string;
    dateSent: Time;
}
export interface TourProgress {
    userId: Principal;
    completed: boolean;
    lastUpdated: Time;
    steps: Array<TourStep>;
}
export interface PartnerIntegration {
    id: string;
    status: string;
    partnerName: string;
    createdAt: Time;
    integrationType: string;
}
export interface HealthIndicator {
    value: bigint;
    source: string;
    name: string;
    unit: string;
    timestamp: Time;
}
export interface DomainProgress {
    streak: bigint;
    lastUpdated: Time;
    score: bigint;
}
export interface Product {
    id: string;
    protocol: string;
    name: string;
    recommended: boolean;
    description: string;
    aiInfo: string;
    vendor: string;
    category: string;
    price: bigint;
    ranking: bigint;
}
export interface UserProfile {
    age: bigint;
    name: string;
    onboardingComplete: boolean;
    agentName: string;
    subscriptionStatus: boolean;
    goals: Array<string>;
    healthConcerns: Array<string>;
    privacyConsent: boolean;
}
export enum HealthDomain {
    mental = "mental",
    longevity = "longevity",
    community = "community",
    fitness = "fitness",
    environment = "environment",
    purpose = "purpose",
    nutrition = "nutrition",
    finances = "finances"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAgentInteraction(interaction: AgentInteraction): Promise<void>;
    addBadge(badge: Badge): Promise<void>;
    addCoachingSession(session: CoachingSession): Promise<void>;
    addDomainAgent(agent: DomainAgent): Promise<void>;
    addExtractedData(recordId: string, extractedData: Array<ExtractedField>): Promise<void>;
    addHealthIndicator(indicator: HealthIndicator): Promise<void>;
    addLeaderboardEntry(entry: LeaderboardEntry): Promise<void>;
    addNotification(targetUserId: Principal, notification: Notification): Promise<void>;
    addPartnerIntegration(partnerName: string, integrationType: string): Promise<void>;
    addProduct(product: Product): Promise<void>;
    addReward(reward: Reward): Promise<void>;
    addWhitePaperSection(documentId: string, section: WhitePaperSection): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimReferralReward(code: string): Promise<void>;
    completeOnboarding(): Promise<void>;
    connectWearable(service: string, accessToken: string, refreshToken: string | null, expiresAt: Time | null): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCustomCheckoutSession(cart: Array<Product>, totalAmount: bigint, paymentMethod: string): Promise<string>;
    createCustomMetric(metric: CustomMetric): Promise<void>;
    createHealthProtocol(protocol: HealthProtocol): Promise<void>;
    createProfessionalAccessToken(token: ProfessionalAccessToken): Promise<void>;
    createReferral(code: string): Promise<void>;
    createWhitePaperDocument(title: string): Promise<string>;
    deleteCheckoutSession(sessionId: string): Promise<void>;
    deleteHealthRecord(recordId: string): Promise<void>;
    deletePaymentTransaction(transactionId: string): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    deleteUploadStatus(recordId: string): Promise<void>;
    deleteWhitePaperDocument(documentId: string): Promise<void>;
    deleteWhitePaperSection(documentId: string, sectionId: string): Promise<void>;
    dropFileReference(path: string): Promise<void>;
    getAIMemoryProfile(): Promise<AIMemoryProfile | null>;
    getAgentInteractions(): Promise<Array<AgentInteraction>>;
    getAllReferrals(): Promise<Array<Referral>>;
    getAllWhitePaperDocuments(): Promise<Array<WhitePaperDocument>>;
    getAnalyticsAggregates(): Promise<Array<AnalyticsAggregate>>;
    getBadges(): Promise<Array<Badge>>;
    getBrandSuggestions(): Promise<Array<BrandSuggestion>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckoutSessionById(sessionId: string): Promise<CheckoutSession | null>;
    getCheckoutSessions(): Promise<Array<CheckoutSession>>;
    getCoachingSessions(): Promise<Array<CoachingSession>>;
    getCommunityProposals(): Promise<Array<CommunityProposal>>;
    getCustomMetrics(): Promise<Array<CustomMetric>>;
    getDashboardPreferences(): Promise<DashboardPreference | null>;
    getDomainAgents(): Promise<Array<DomainAgent>>;
    getDomainProgress(): Promise<Array<[HealthDomain, DomainProgress]>>;
    getFileReference(path: string): Promise<FileReference>;
    getGrantKPIs(): Promise<Array<GrantKPI>>;
    getHealthIndicators(): Promise<Array<HealthIndicator>>;
    getHealthProtocol(protocolId: string): Promise<HealthProtocol | null>;
    getHealthRecordById(recordId: string): Promise<HealthRecord | null>;
    getHealthRecords(): Promise<Array<HealthRecord>>;
    getHelpPreferences(): Promise<HelpPreference | null>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getLiquidityPools(): Promise<Array<LiquidityPool>>;
    getNotificationPreferences(): Promise<NotificationPreference | null>;
    getNotifications(): Promise<Array<Notification>>;
    getPartnerIntegrations(): Promise<Array<PartnerIntegration>>;
    getPaymentTransactionById(transactionId: string): Promise<PaymentTransaction | null>;
    getPaymentTransactions(): Promise<Array<PaymentTransaction>>;
    getPerformanceMetrics(): Promise<Array<PerformanceMetric>>;
    getProductById(productId: string): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProfessionalAccessToken(tokenId: string): Promise<ProfessionalAccessToken | null>;
    getPromptSuggestions(): Promise<Array<PromptSuggestion>>;
    getProtocolProgress(protocolId: string): Promise<ProtocolProgress | null>;
    getPublicSystemMetrics(): Promise<Array<SystemMetric>>;
    getQuickActions(): Promise<Array<QuickAction>>;
    getReferral(code: string): Promise<Referral | null>;
    getRewards(): Promise<Array<Reward>>;
    getScheduledNotifications(): Promise<Array<ScheduledNotification>>;
    getStakingPositions(): Promise<Array<StakingPosition>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSystemMetrics(): Promise<Array<SystemMetric>>;
    getTourProgress(): Promise<TourProgress | null>;
    getTransparencyLogs(): Promise<Array<TransparencyLog>>;
    getUploadStatusById(recordId: string): Promise<UploadStatus | null>;
    getUploadStatuses(): Promise<Array<UploadStatus>>;
    getUserHealthProtocols(): Promise<Array<HealthProtocol>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWearableConnections(): Promise<Array<WearableConnection>>;
    getWhitePaperDocument(documentId: string): Promise<WhitePaperDocument | null>;
    getZKProofs(): Promise<Array<ZKProof>>;
    initializeAccessControl(): Promise<void>;
    isBlackboardLocked(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isOnboardingComplete(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listFileReferences(): Promise<Array<FileReference>>;
    lockBlackboard(): Promise<string>;
    logTransparencyAction(action: string, dataHash: string, status: string): Promise<void>;
    processPayment(amount: bigint, vendor: string, paymentMethod: string): Promise<string>;
    recordAnalyticsAggregate(metricType: string, value: bigint): Promise<void>;
    recordGrantKPI(kpi: GrantKPI): Promise<void>;
    recordPerformanceMetric(canister: string, metricType: string, value: bigint): Promise<void>;
    recordSystemMetric(metric: SystemMetric): Promise<void>;
    registerFileReference(path: string, hash: string): Promise<void>;
    revokeProfessionalAccessToken(tokenId: string): Promise<void>;
    saveAIMemoryProfile(profile: AIMemoryProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDashboardPreferences(preferences: DashboardPreference): Promise<void>;
    saveHelpPreferences(preferences: HelpPreference): Promise<void>;
    saveNotificationPreferences(preferences: NotificationPreference): Promise<void>;
    savePromptSuggestions(suggestions: Array<PromptSuggestion>): Promise<void>;
    saveQuickActions(actions: Array<QuickAction>): Promise<void>;
    saveTourProgress(progress: TourProgress): Promise<void>;
    scheduleNotification(notification: ScheduledNotification): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    stakeTokens(amount: bigint, lockupPeriod: bigint): Promise<void>;
    submitBrandSuggestion(brandName: string, category: string, reason: string | null, userEmail: string): Promise<void>;
    submitCommunityProposal(title: string, description: string): Promise<void>;
    submitZKProof(proofData: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unlockBlackboard(): Promise<string>;
    unstakeTokens(positionIndex: bigint): Promise<void>;
    updateCheckoutSession(sessionId: string, updatedSession: CheckoutSession): Promise<void>;
    updateDomainProgress(domain: HealthDomain, progress: DomainProgress): Promise<void>;
    updateLiquidityPools(): Promise<void>;
    updatePaymentTransaction(transactionId: string, updatedTransaction: PaymentTransaction): Promise<void>;
    updateProduct(productId: string, updatedProduct: Product): Promise<void>;
    updateProtocolProgress(progress: ProtocolProgress): Promise<void>;
    updateReviewStatus(recordId: string, reviewStatus: string): Promise<void>;
    updateUploadStatus(recordId: string, status: string, progress: bigint, errorMessage: string | null): Promise<void>;
    updateWhitePaperSection(documentId: string, sectionId: string, updatedSection: WhitePaperSection): Promise<void>;
    updateWhitePaperStatus(documentId: string, status: string): Promise<void>;
    uploadHealthRecord(filePath: string, fileType: string): Promise<string>;
    voteOnProposal(proposalId: string): Promise<void>;
}
