import AccessControl "authorization/access-control";
import Registry "blob-storage/registry";
import Stripe "stripe/stripe";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";
import OutCall "http-outcalls/outcall";
import Int "mo:base/Int";
import Float "mo:base/Float";

actor AscendHealth {
  let accessControlState = AccessControl.initState();
  let registry = Registry.new();
  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  transient let textMap = OrderedMap.Make<Text>(Text.compare);

  type HealthDomain = {
    #fitness;
    #nutrition;
    #mental;
    #finances;
    #community;
    #environment;
    #purpose;
    #longevity;
  };

  type UserProfile = {
    name : Text;
    age : Nat;
    healthConcerns : [Text];
    goals : [Text];
    agentName : Text;
    privacyConsent : Bool;
    subscriptionStatus : Bool;
    onboardingComplete : Bool;
  };

  type DomainProgress = {
    score : Nat;
    lastUpdated : Time.Time;
    streak : Nat;
  };

  type Badge = {
    id : Text;
    name : Text;
    description : Text;
    dateEarned : Time.Time;
  };

  type Reward = {
    id : Text;
    type_ : Text;
    amount : Nat;
    dateAwarded : Time.Time;
  };

  type LeaderboardEntry = {
    userId : Text;
    score : Nat;
    domain : HealthDomain;
  };

  type AgentInteraction = {
    message : Text;
    response : Text;
    timestamp : Time.Time;
  };

  type Notification = {
    id : Text;
    type_ : Text;
    message : Text;
    dateSent : Time.Time;
    read : Bool;
  };

  type CustomMetric = {
    id : Text;
    name : Text;
    value : Nat;
    domain : HealthDomain;
    createdAt : Time.Time;
  };

  type StakingPosition = {
    userId : Principal;
    amount : Nat;
    lockupPeriod : Nat;
    startTime : Time.Time;
    rewardMultiplier : Nat;
    active : Bool;
  };

  type LiquidityPool = {
    id : Text;
    tokenPair : Text;
    apy : Nat;
    totalLiquidity : Nat;
    volume : Nat;
  };

  type Referral = {
    code : Text;
    referrer : Principal;
    referee : ?Principal;
    rewardClaimed : Bool;
    timestamp : Time.Time;
  };

  type BrandSuggestion = {
    brandName : Text;
    category : Text;
    reason : ?Text;
    userEmail : Text;
    timestamp : Time.Time;
    reviewed : Bool;
  };

  type WearableConnection = {
    service : Text;
    accessToken : Text;
    refreshToken : ?Text;
    expiresAt : ?Time.Time;
    connectedAt : Time.Time;
  };

  type HealthIndicator = {
    name : Text;
    value : Nat;
    unit : Text;
    source : Text;
    timestamp : Time.Time;
  };

  type TourStep = {
    id : Text;
    title : Text;
    description : Text;
    target : Text;
    order : Nat;
    completed : Bool;
  };

  type TourProgress = {
    userId : Principal;
    steps : [TourStep];
    completed : Bool;
    lastUpdated : Time.Time;
  };

  type DashboardPreference = {
    userId : Principal;
    cardOrder : [Text];
    hiddenCards : [Text];
    notificationPreferences : [Text];
    lastUpdated : Time.Time;
  };

  type PromptSuggestion = {
    id : Text;
    prompt : Text;
    context : Text;
    usageCount : Nat;
    lastUsed : Time.Time;
  };

  type HelpPreference = {
    userId : Principal;
    showHelp : Bool;
    completedTutorials : [Text];
    lastUpdated : Time.Time;
  };

  type QuickAction = {
    id : Text;
    action : Text;
    context : Text;
    usageCount : Nat;
    lastUsed : Time.Time;
  };

  type HealthRecord = {
    id : Text;
    userId : Principal;
    filePath : Text;
    fileType : Text;
    uploadTime : Time.Time;
    status : Text;
    extractedData : ?[ExtractedField];
    reviewStatus : Text;
  };

  type ExtractedField = {
    fieldName : Text;
    value : Text;
    domain : Text;
    indicator : Text;
    confidence : Nat;
    source : Text;
  };

  type UploadStatus = {
    id : Text;
    userId : Principal;
    filePath : Text;
    status : Text;
    progress : Nat;
    errorMessage : ?Text;
    timestamp : Time.Time;
  };

  type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    vendor : Text;
    recommended : Bool;
    ranking : Nat;
    aiInfo : Text;
    protocol : Text;
  };

  type CheckoutSession = {
    id : Text;
    userId : Principal;
    cart : [Product];
    totalAmount : Nat;
    paymentMethod : Text;
    status : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type PaymentTransaction = {
    id : Text;
    userId : Principal;
    amount : Nat;
    vendor : Text;
    paymentMethod : Text;
    status : Text;
    timestamp : Time.Time;
    errorMessage : ?Text;
  };

  type TransparencyLog = {
    id : Text;
    userId : Principal;
    action : Text;
    dataHash : Text;
    timestamp : Time.Time;
    status : Text;
  };

  type PerformanceMetric = {
    id : Text;
    canister : Text;
    metricType : Text;
    value : Nat;
    timestamp : Time.Time;
  };

  type CommunityProposal = {
    id : Text;
    title : Text;
    description : Text;
    proposer : Principal;
    votes : Nat;
    status : Text;
    createdAt : Time.Time;
  };

  type ZKProof = {
    id : Text;
    userId : Principal;
    proofData : Text;
    timestamp : Time.Time;
    verified : Bool;
  };

  type PartnerIntegration = {
    id : Text;
    partnerName : Text;
    integrationType : Text;
    status : Text;
    createdAt : Time.Time;
  };

  type AnalyticsAggregate = {
    id : Text;
    metricType : Text;
    value : Nat;
    timestamp : Time.Time;
  };

  type WhitePaperSection = {
    id : Text;
    title : Text;
    content : Text;
    order : Nat;
    lastUpdated : Time.Time;
  };

  type WhitePaperDocument = {
    id : Text;
    title : Text;
    sections : [WhitePaperSection];
    createdAt : Time.Time;
    updatedAt : Time.Time;
    version : Nat;
    status : Text;
  };

  // Sprint 1: AI Memory Profile Types
  type AIMemoryProfile = {
    userId : Principal;
    healthStats : [(Text, Nat)];
    preferences : [(Text, Text)];
    toneVectors : [(Text, Nat)];
    communicationStyle : Text;
    goalPriorities : [Text];
    interactionHistory : [Text];
    lastUpdated : Time.Time;
  };

  type DomainAgent = {
    domain : HealthDomain;
    userId : Principal;
    lastCheck : Time.Time;
    insights : [Text];
    recommendations : [Text];
    active : Bool;
  };

  type CoachingSession = {
    userId : Principal;
    sessionId : Text;
    recommendations : [Text];
    userResponse : ?Text;
    effectiveness : Nat;
    timestamp : Time.Time;
  };

  // Sprint 2: Protocol Builder Types
  type HealthProtocol = {
    id : Text;
    userId : Principal;
    name : Text;
    goals : [Text];
    timeframe : Nat;
    metrics : [(Text, Nat)];
    actions : [Text];
    createdBy : Principal;
    createdAt : Time.Time;
    version : Nat;
    status : Text;
  };

  type ProfessionalAccessToken = {
    tokenId : Text;
    professionalId : Principal;
    userId : Principal;
    expiresAt : Time.Time;
    permissions : [Text];
    active : Bool;
    createdAt : Time.Time;
  };

  type ProtocolProgress = {
    protocolId : Text;
    userId : Principal;
    completedActions : [Text];
    currentMetrics : [(Text, Nat)];
    milestones : [(Text, Bool)];
    lastUpdated : Time.Time;
  };

  // Sprint 3: Notification System Types
  type NotificationPreference = {
    userId : Principal;
    frequency : Text;
    tone : Text;
    quietHours : [(Nat, Nat)];
    enabledTypes : [Text];
    lastUpdated : Time.Time;
  };

  type ScheduledNotification = {
    id : Text;
    userId : Principal;
    message : Text;
    scheduledTime : Time.Time;
    sentimentIntensity : Text;
    status : Text;
    createdAt : Time.Time;
  };

  // Sprint 4: Analytics Types
  type GrantKPI = {
    id : Text;
    metricName : Text;
    value : Nat;
    period : Text;
    timestamp : Time.Time;
  };

  type SystemMetric = {
    id : Text;
    proofsPerDay : Nat;
    aiProcessingTime : Nat;
    cycleUsage : Nat;
    stakingTotals : Nat;
    userEngagement : Nat;
    timestamp : Time.Time;
  };

  // Sprint 2 Phase A Step 1-2: Blackboard Core Entry Type
  type Entry = {
    domain : Text;
    insight : Text;
    confidence : Float;
    timestamp : Time.Time;
  };

  var userProfiles = principalMap.empty<UserProfile>();
  var domainProgress = principalMap.empty<OrderedMap.Map<Text, DomainProgress>>();
  var badges = principalMap.empty<[Badge]>();
  var rewards = principalMap.empty<[Reward]>();
  var leaderboard = textMap.empty<LeaderboardEntry>();
  var agentInteractions = principalMap.empty<[AgentInteraction]>();
  var notifications = principalMap.empty<[Notification]>();
  var customMetrics = principalMap.empty<[CustomMetric]>();
  var stakingPositions = principalMap.empty<[StakingPosition]>();
  var liquidityPools = textMap.empty<LiquidityPool>();
  var referrals = textMap.empty<Referral>();
  var brandSuggestions = textMap.empty<BrandSuggestion>();
  var wearableConnections = principalMap.empty<[WearableConnection]>();
  var healthIndicators = principalMap.empty<[HealthIndicator]>();
  var tourProgress = principalMap.empty<TourProgress>();
  var dashboardPreferences = principalMap.empty<DashboardPreference>();
  var promptSuggestions = principalMap.empty<[PromptSuggestion]>();
  var helpPreferences = principalMap.empty<HelpPreference>();
  var quickActions = principalMap.empty<[QuickAction]>();
  var healthRecords = principalMap.empty<[HealthRecord]>();
  var uploadStatuses = principalMap.empty<[UploadStatus]>();
  var products = textMap.empty<Product>();
  var checkoutSessions = textMap.empty<CheckoutSession>();
  var paymentTransactions = textMap.empty<PaymentTransaction>();
  var transparencyLogs = textMap.empty<TransparencyLog>();
  var performanceMetrics = textMap.empty<PerformanceMetric>();
  var communityProposals = textMap.empty<CommunityProposal>();
  var zkProofs = textMap.empty<ZKProof>();
  var partnerIntegrations = textMap.empty<PartnerIntegration>();
  var analyticsAggregates = textMap.empty<AnalyticsAggregate>();
  var whitePaperDocuments = textMap.empty<WhitePaperDocument>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Sprint 1: AI Memory Storage
  var aiMemoryProfiles = principalMap.empty<AIMemoryProfile>();
  var domainAgents = principalMap.empty<[DomainAgent]>();
  var coachingSessions = principalMap.empty<[CoachingSession]>();

  // Sprint 2: Protocol Storage
  var healthProtocols = textMap.empty<HealthProtocol>();
  var professionalAccessTokens = textMap.empty<ProfessionalAccessToken>();
  var protocolProgress = textMap.empty<ProtocolProgress>();

  // Sprint 3: Notification Storage
  var notificationPreferences = principalMap.empty<NotificationPreference>();
  var scheduledNotifications = textMap.empty<ScheduledNotification>();

  // Sprint 4: Analytics Storage
  var grantKPIs = textMap.empty<GrantKPI>();
  var systemMetrics = textMap.empty<SystemMetric>();

  // Sprint 2 Phase A Step 1-2: Blackboard Core Storage
  var blackboard : ?OrderedMap.Map<Text, Entry> = null;
  
  // Sprint 2 Phase A Step 2: Blackboard Write-Lock Flag
  // Boolean flag to prevent concurrent agent writes
  // Initialized to false by default, automatically reset on blackboard clear or session reset
  var isWriteLocked : Bool = false;

  // Helper function for lazy initialization of blackboard
  func getOrInitBlackboard(caller : Principal) : OrderedMap.Map<Text, Entry> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can access blackboard");
    };
    
    switch (blackboard) {
      case null {
        let newBlackboard = textMap.empty<Entry>();
        blackboard := ?newBlackboard;
        newBlackboard;
      };
      case (?existingBlackboard) {
        existingBlackboard;
      };
    };
  };

  // Sprint 2 Phase A Step 2: Blackboard Write-Lock Functions

  // Acquires write lock for blackboard operations
  // Returns confirmation text or error message without using Debug.trap
  // Only authenticated users (#user or #admin) can acquire the lock
  public shared ({ caller }) func lockBlackboard() : async Text {
    // Access control guard: only authenticated users can lock
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "Unauthorized: Only authenticated users can lock the blackboard.";
    };

    // Check if already locked
    if (isWriteLocked) {
      return "Write lock already active. Please wait for current operation to complete.";
    };

    // Acquire lock
    isWriteLocked := true;
    "Write lock activated.";
  };

  // Releases write lock after safe writes complete
  // Returns confirmation text or error message without using Debug.trap
  // Only authenticated users (#user or #admin) can release the lock
  public shared ({ caller }) func unlockBlackboard() : async Text {
    // Access control guard: only authenticated users can unlock
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return "Unauthorized: Only authenticated users can unlock the blackboard.";
    };

    // Check if lock is not active
    if (not isWriteLocked) {
      return "Write lock is not active. No unlock operation needed.";
    };

    // Release lock
    isWriteLocked := false;
    "Write lock released.";
  };

  // Query function to check current lock status
  // Allows authenticated users to check if blackboard is currently locked
  public query ({ caller }) func isBlackboardLocked() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can check lock status");
    };
    isWriteLocked;
  };

  // Placeholder: Future write function for adding entries to blackboard (Step A.2.4+)
  // Will enable agents to share insights across domains with proper authorization

  // Placeholder: Future retrieval function for querying blackboard entries (Step A.2.5+)
  // Will allow agents to access shared insights with filtering by domain/confidence

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func completeOnboarding() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can complete onboarding");
    };

    switch (principalMap.get(userProfiles, caller)) {
      case null {
        Debug.trap("User profile not found");
      };
      case (?profile) {
        if (profile.name == "" or profile.age == 0 or not profile.privacyConsent) {
          Debug.trap("Incomplete onboarding data");
        };

        let updatedProfile = {
          profile with
          onboardingComplete = true;
        };
        userProfiles := principalMap.put(userProfiles, caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func isOnboardingComplete() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can check onboarding status");
    };
    switch (principalMap.get(userProfiles, caller)) {
      case null { false };
      case (?profile) { profile.onboardingComplete };
    };
  };

  public shared ({ caller }) func updateDomainProgress(domain : HealthDomain, progress : DomainProgress) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update progress");
    };
    let userDomainProgress = switch (principalMap.get(domainProgress, caller)) {
      case null { textMap.empty<DomainProgress>() };
      case (?progressMap) { progressMap };
    };
    let domainKey = switch (domain) {
      case (#fitness) { "fitness" };
      case (#nutrition) { "nutrition" };
      case (#mental) { "mental" };
      case (#finances) { "finances" };
      case (#community) { "community" };
      case (#environment) { "environment" };
      case (#purpose) { "purpose" };
      case (#longevity) { "longevity" };
    };
    let updatedProgress = textMap.put(userDomainProgress, domainKey, progress);
    domainProgress := principalMap.put(domainProgress, caller, updatedProgress);
  };

  public query ({ caller }) func getDomainProgress() : async [(HealthDomain, DomainProgress)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view domain progress");
    };
    switch (principalMap.get(domainProgress, caller)) {
      case null { [] };
      case (?progressMap) {
        let entries = textMap.entries(progressMap);
        Array.map<(Text, DomainProgress), (HealthDomain, DomainProgress)>(
          Iter.toArray(entries),
          func((domainText, progress)) {
            let domain = switch (domainText) {
              case "fitness" { #fitness };
              case "nutrition" { #nutrition };
              case "mental" { #mental };
              case "finances" { #finances };
              case "community" { #community };
              case "environment" { #environment };
              case "purpose" { #purpose };
              case "longevity" { #longevity };
              case _ { #fitness };
            };
            (domain, progress);
          },
        );
      };
    };
  };

  public shared ({ caller }) func addBadge(badge : Badge) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add badges");
    };
    let userBadges = switch (principalMap.get(badges, caller)) {
      case null { [] };
      case (?existingBadges) { existingBadges };
    };
    badges := principalMap.put(badges, caller, Array.append(userBadges, [badge]));
  };

  public query ({ caller }) func getBadges() : async [Badge] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view badges");
    };
    switch (principalMap.get(badges, caller)) {
      case null { [] };
      case (?userBadges) { userBadges };
    };
  };

  public shared ({ caller }) func addReward(reward : Reward) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add rewards");
    };
    let userRewards = switch (principalMap.get(rewards, caller)) {
      case null { [] };
      case (?existingRewards) { existingRewards };
    };
    rewards := principalMap.put(rewards, caller, Array.append(userRewards, [reward]));
  };

  public query ({ caller }) func getRewards() : async [Reward] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view rewards");
    };
    switch (principalMap.get(rewards, caller)) {
      case null { [] };
      case (?userRewards) { userRewards };
    };
  };

  public shared ({ caller }) func addLeaderboardEntry(entry : LeaderboardEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add leaderboard entries");
    };
    leaderboard := textMap.put(leaderboard, entry.userId, entry);
  };

  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view leaderboard");
    };
    Iter.toArray(textMap.vals(leaderboard));
  };

  public shared ({ caller }) func addAgentInteraction(interaction : AgentInteraction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add agent interactions");
    };
    let userInteractions = switch (principalMap.get(agentInteractions, caller)) {
      case null { [] };
      case (?existingInteractions) { existingInteractions };
    };
    agentInteractions := principalMap.put(agentInteractions, caller, Array.append(userInteractions, [interaction]));
  };

  public query ({ caller }) func getAgentInteractions() : async [AgentInteraction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view agent interactions");
    };
    switch (principalMap.get(agentInteractions, caller)) {
      case null { [] };
      case (?userInteractions) { userInteractions };
    };
  };

  public shared ({ caller }) func addNotification(targetUserId : Principal, notification : Notification) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add notifications");
    };
    let userNotifications = switch (principalMap.get(notifications, targetUserId)) {
      case null { [] };
      case (?existingNotifications) { existingNotifications };
    };
    notifications := principalMap.put(notifications, targetUserId, Array.append(userNotifications, [notification]));
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view notifications");
    };
    switch (principalMap.get(notifications, caller)) {
      case null { [] };
      case (?userNotifications) { userNotifications };
    };
  };

  public shared ({ caller }) func registerFileReference(path : Text, hash : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can register file references");
    };
    Registry.add(registry, path, hash);
  };

  public query ({ caller }) func getFileReference(path : Text) : async Registry.FileReference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can get file references");
    };
    Registry.get(registry, path);
  };

  public query ({ caller }) func listFileReferences() : async [Registry.FileReference] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can list file references");
    };
    Registry.list(registry);
  };

  public shared ({ caller }) func dropFileReference(path : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can drop file references");
    };
    Registry.remove(registry, path);
  };

  public shared ({ caller }) func createCustomMetric(metric : CustomMetric) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create custom metrics");
    };
    let userMetrics = switch (principalMap.get(customMetrics, caller)) {
      case null { [] };
      case (?existingMetrics) { existingMetrics };
    };
    customMetrics := principalMap.put(customMetrics, caller, Array.append(userMetrics, [metric]));
  };

  public query ({ caller }) func getCustomMetrics() : async [CustomMetric] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view custom metrics");
    };
    switch (principalMap.get(customMetrics, caller)) {
      case null { [] };
      case (?userMetrics) { userMetrics };
    };
  };

  public shared ({ caller }) func stakeTokens(amount : Nat, lockupPeriod : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can stake tokens");
    };

    let rewardMultiplier = switch (lockupPeriod) {
      case 30 { 1 };
      case 90 { 2 };
      case 180 { 3 };
      case 365 { 4 };
      case _ { 1 };
    };

    let stakingPosition : StakingPosition = {
      userId = caller;
      amount;
      lockupPeriod;
      startTime = Time.now();
      rewardMultiplier;
      active = true;
    };

    let userStakingPositions = switch (principalMap.get(stakingPositions, caller)) {
      case null { [] };
      case (?existingPositions) { existingPositions };
    };
    stakingPositions := principalMap.put(stakingPositions, caller, Array.append(userStakingPositions, [stakingPosition]));
  };

  public shared ({ caller }) func unstakeTokens(positionIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can unstake tokens");
    };

    switch (principalMap.get(stakingPositions, caller)) {
      case null {
        Debug.trap("No staking positions found");
      };
      case (?userPositions) {
        if (positionIndex >= userPositions.size()) {
          Debug.trap("Invalid position index");
        };

        let position = userPositions[positionIndex];
        let currentTime = Time.now();
        let lockupPeriodNanos = position.lockupPeriod * 24 * 60 * 60 * 1_000_000_000;

        if (currentTime < position.startTime + lockupPeriodNanos) {
          Debug.trap("Lockup period not yet completed");
        };

        let updatedPositions = Array.tabulate<StakingPosition>(
          userPositions.size(),
          func(i : Nat) : StakingPosition {
            if (i == positionIndex) {
              { position with active = false };
            } else {
              userPositions[i];
            };
          },
        );
        stakingPositions := principalMap.put(stakingPositions, caller, updatedPositions);
      };
    };
  };

  public query ({ caller }) func getStakingPositions() : async [StakingPosition] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view staking positions");
    };
    switch (principalMap.get(stakingPositions, caller)) {
      case null { [] };
      case (?userPositions) { userPositions };
    };
  };

  public query ({ caller }) func getLiquidityPools() : async [LiquidityPool] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view liquidity pools");
    };
    Iter.toArray(textMap.vals(liquidityPools));
  };

  public shared ({ caller }) func updateLiquidityPools() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update liquidity pools");
    };
    let url = "https://icpswap.com/api/v1/pools";
    let response = await OutCall.httpGetRequest(url, [], transform);
    let pools = parseLiquidityPools(response);
    for (pool in pools.vals()) {
      liquidityPools := textMap.put(liquidityPools, pool.id, pool);
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can use transform");
    };
    OutCall.transform(input);
  };

  func parseLiquidityPools(_json : Text) : [LiquidityPool] {
    [];
  };

  public shared ({ caller }) func createReferral(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create referrals");
    };

    let referral : Referral = {
      code;
      referrer = caller;
      referee = null;
      rewardClaimed = false;
      timestamp = Time.now();
    };

    referrals := textMap.put(referrals, code, referral);
  };

  public query ({ caller }) func getReferral(code : Text) : async ?Referral {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view referrals");
    };
    textMap.get(referrals, code);
  };

  public shared ({ caller }) func claimReferralReward(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can claim referral rewards");
    };
    switch (textMap.get(referrals, code)) {
      case null {
        Debug.trap("Referral code not found");
      };
      case (?referral) {
        if (referral.rewardClaimed) {
          Debug.trap("Reward already claimed");
        };

        if (referral.referrer == caller) {
          Debug.trap("Cannot claim your own referral reward");
        };

        let updatedReferral = {
          referral with
          referee = ?caller;
          rewardClaimed = true;
        };
        referrals := textMap.put(referrals, code, updatedReferral);
      };
    };
  };

  public query ({ caller }) func getAllReferrals() : async [Referral] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view all referrals");
    };
    Iter.toArray(textMap.vals(referrals));
  };

  public shared ({ caller }) func submitBrandSuggestion(brandName : Text, category : Text, reason : ?Text, userEmail : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can submit brand suggestions");
    };

    let suggestion : BrandSuggestion = {
      brandName;
      category;
      reason;
      userEmail;
      timestamp = Time.now();
      reviewed = false;
    };

    brandSuggestions := textMap.put(brandSuggestions, brandName, suggestion);
  };

  public query ({ caller }) func getBrandSuggestions() : async [BrandSuggestion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view brand suggestions");
    };
    Iter.toArray(textMap.vals(brandSuggestions));
  };

  public shared ({ caller }) func connectWearable(service : Text, accessToken : Text, refreshToken : ?Text, expiresAt : ?Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can connect wearables");
    };

    let connection : WearableConnection = {
      service;
      accessToken;
      refreshToken;
      expiresAt;
      connectedAt = Time.now();
    };

    let userConnections = switch (principalMap.get(wearableConnections, caller)) {
      case null { [] };
      case (?existingConnections) { existingConnections };
    };
    wearableConnections := principalMap.put(wearableConnections, caller, Array.append(userConnections, [connection]));
  };

  public query ({ caller }) func getWearableConnections() : async [WearableConnection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view wearable connections");
    };
    switch (principalMap.get(wearableConnections, caller)) {
      case null { [] };
      case (?userConnections) { userConnections };
    };
  };

  public shared ({ caller }) func addHealthIndicator(indicator : HealthIndicator) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add health indicators");
    };
    let userIndicators = switch (principalMap.get(healthIndicators, caller)) {
      case null { [] };
      case (?existingIndicators) { existingIndicators };
    };
    healthIndicators := principalMap.put(healthIndicators, caller, Array.append(userIndicators, [indicator]));
  };

  public query ({ caller }) func getHealthIndicators() : async [HealthIndicator] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view health indicators");
    };
    switch (principalMap.get(healthIndicators, caller)) {
      case null { [] };
      case (?userIndicators) { userIndicators };
    };
  };

  public shared ({ caller }) func saveTourProgress(progress : TourProgress) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save tour progress");
    };
    if (progress.userId != caller) {
      Debug.trap("Unauthorized: Can only save your own tour progress");
    };
    tourProgress := principalMap.put(tourProgress, caller, progress);
  };

  public query ({ caller }) func getTourProgress() : async ?TourProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view tour progress");
    };
    principalMap.get(tourProgress, caller);
  };

  public shared ({ caller }) func saveDashboardPreferences(preferences : DashboardPreference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save dashboard preferences");
    };
    if (preferences.userId != caller) {
      Debug.trap("Unauthorized: Can only save your own dashboard preferences");
    };
    dashboardPreferences := principalMap.put(dashboardPreferences, caller, preferences);
  };

  public query ({ caller }) func getDashboardPreferences() : async ?DashboardPreference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view dashboard preferences");
    };
    principalMap.get(dashboardPreferences, caller);
  };

  public shared ({ caller }) func savePromptSuggestions(suggestions : [PromptSuggestion]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save prompt suggestions");
    };
    promptSuggestions := principalMap.put(promptSuggestions, caller, suggestions);
  };

  public query ({ caller }) func getPromptSuggestions() : async [PromptSuggestion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view prompt suggestions");
    };
    switch (principalMap.get(promptSuggestions, caller)) {
      case null { [] };
      case (?suggestions) { suggestions };
    };
  };

  public shared ({ caller }) func saveHelpPreferences(preferences : HelpPreference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save help preferences");
    };
    if (preferences.userId != caller) {
      Debug.trap("Unauthorized: Can only save your own help preferences");
    };
    helpPreferences := principalMap.put(helpPreferences, caller, preferences);
  };

  public query ({ caller }) func getHelpPreferences() : async ?HelpPreference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view help preferences");
    };
    principalMap.get(helpPreferences, caller);
  };

  public shared ({ caller }) func saveQuickActions(actions : [QuickAction]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save quick actions");
    };
    quickActions := principalMap.put(quickActions, caller, actions);
  };

  public query ({ caller }) func getQuickActions() : async [QuickAction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view quick actions");
    };
    switch (principalMap.get(quickActions, caller)) {
      case null { [] };
      case (?actions) { actions };
    };
  };

  public shared ({ caller }) func uploadHealthRecord(filePath : Text, fileType : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can upload health records");
    };

    let recordId = Text.concat("record-", Nat.toText(Int.abs(Time.now())));
    let healthRecord : HealthRecord = {
      id = recordId;
      userId = caller;
      filePath;
      fileType;
      uploadTime = Time.now();
      status = "uploaded";
      extractedData = null;
      reviewStatus = "pending";
    };

    let userRecords = switch (principalMap.get(healthRecords, caller)) {
      case null { [] };
      case (?existingRecords) { existingRecords };
    };
    healthRecords := principalMap.put(healthRecords, caller, Array.append(userRecords, [healthRecord]));

    let uploadStatus : UploadStatus = {
      id = recordId;
      userId = caller;
      filePath;
      status = "processing";
      progress = 0;
      errorMessage = null;
      timestamp = Time.now();
    };

    let userStatuses = switch (principalMap.get(uploadStatuses, caller)) {
      case null { [] };
      case (?existingStatuses) { existingStatuses };
    };
    uploadStatuses := principalMap.put(uploadStatuses, caller, Array.append(userStatuses, [uploadStatus]));

    recordId;
  };

  public shared ({ caller }) func updateUploadStatus(recordId : Text, status : Text, progress : Nat, errorMessage : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update upload status");
    };

    switch (principalMap.get(uploadStatuses, caller)) {
      case null {
        Debug.trap("No upload statuses found");
      };
      case (?userStatuses) {
        let updatedStatuses = Array.map<UploadStatus, UploadStatus>(
          userStatuses,
          func(s : UploadStatus) : UploadStatus {
            if (s.id == recordId) {
              {
                s with
                status;
                progress;
                errorMessage;
                timestamp = Time.now();
              };
            } else { s };
          },
        );
        uploadStatuses := principalMap.put(uploadStatuses, caller, updatedStatuses);
      };
    };
  };

  public shared ({ caller }) func addExtractedData(recordId : Text, extractedData : [ExtractedField]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add extracted data");
    };

    switch (principalMap.get(healthRecords, caller)) {
      case null {
        Debug.trap("No health records found");
      };
      case (?userRecords) {
        let updatedRecords = Array.map<HealthRecord, HealthRecord>(
          userRecords,
          func(r : HealthRecord) : HealthRecord {
            if (r.id == recordId) {
              {
                r with
                extractedData = ?extractedData;
                status = "extracted";
                reviewStatus = "pending";
              };
            } else { r };
          },
        );
        healthRecords := principalMap.put(healthRecords, caller, updatedRecords);
      };
    };
  };

  public shared ({ caller }) func updateReviewStatus(recordId : Text, reviewStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update review status");
    };

    switch (principalMap.get(healthRecords, caller)) {
      case null {
        Debug.trap("No health records found");
      };
      case (?userRecords) {
        let updatedRecords = Array.map<HealthRecord, HealthRecord>(
          userRecords,
          func(r : HealthRecord) : HealthRecord {
            if (r.id == recordId) {
              {
                r with
                reviewStatus;
                status = if (reviewStatus == "approved") { "completed" } else {
                  "pending";
                };
              };
            } else { r };
          },
        );
        healthRecords := principalMap.put(healthRecords, caller, updatedRecords);
      };
    };
  };

  public query ({ caller }) func getHealthRecords() : async [HealthRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view health records");
    };
    switch (principalMap.get(healthRecords, caller)) {
      case null { [] };
      case (?userRecords) { userRecords };
    };
  };

  public query ({ caller }) func getUploadStatuses() : async [UploadStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view upload statuses");
    };
    switch (principalMap.get(uploadStatuses, caller)) {
      case null { [] };
      case (?userStatuses) { userStatuses };
    };
  };

  public query ({ caller }) func getHealthRecordById(recordId : Text) : async ?HealthRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view health records");
    };
    switch (principalMap.get(healthRecords, caller)) {
      case null { null };
      case (?userRecords) {
        for (record in userRecords.vals()) {
          if (record.id == recordId) {
            return ?record;
          };
        };
        null;
      };
    };
  };

  public query ({ caller }) func getUploadStatusById(recordId : Text) : async ?UploadStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view upload statuses");
    };
    switch (principalMap.get(uploadStatuses, caller)) {
      case null { null };
      case (?userStatuses) {
        for (status in userStatuses.vals()) {
          if (status.id == recordId) {
            return ?status;
          };
        };
        null;
      };
    };
  };

  public shared ({ caller }) func deleteHealthRecord(recordId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete health records");
    };

    switch (principalMap.get(healthRecords, caller)) {
      case null {
        Debug.trap("No health records found");
      };
      case (?userRecords) {
        let filteredRecords = Array.filter<HealthRecord>(
          userRecords,
          func(record : HealthRecord) : Bool {
            record.id != recordId;
          },
        );
        healthRecords := principalMap.put(healthRecords, caller, filteredRecords);
      };
    };
  };

  public shared ({ caller }) func deleteUploadStatus(recordId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete upload status");
    };

    switch (principalMap.get(uploadStatuses, caller)) {
      case null {
        Debug.trap("No upload statuses found");
      };
      case (?userStatuses) {
        let filteredStatuses = Array.filter<UploadStatus>(
          userStatuses,
          func(status : UploadStatus) : Bool {
            status.id != recordId;
          },
        );
        uploadStatuses := principalMap.put(uploadStatuses, caller, filteredStatuses);
      };
    };
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add products");
    };
    products := textMap.put(products, product.id, product);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view products");
    };
    Iter.toArray(textMap.vals(products));
  };

  public query ({ caller }) func getProductById(productId : Text) : async ?Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view products");
    };
    textMap.get(products, productId);
  };

  public shared ({ caller }) func updateProduct(productId : Text, updatedProduct : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update products");
    };

    switch (textMap.get(products, productId)) {
      case null {
        Debug.trap("Product not found");
      };
      case (?_existingProduct) {
        products := textMap.put(products, productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete products");
    };

    switch (textMap.get(products, productId)) {
      case null {
        Debug.trap("Product not found");
      };
      case (?_existingProduct) {
        products := textMap.remove(products, productId).0;
      };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create checkout sessions");
    };
    switch (stripeConfig) {
      case null {
        Debug.trap("Stripe configuration not set");
      };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  public shared ({ caller }) func createCustomCheckoutSession(cart : [Product], totalAmount : Nat, paymentMethod : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create checkout sessions");
    };

    let sessionId = Text.concat("checkout-", Nat.toText(Int.abs(Time.now())));
    let checkoutSession : CheckoutSession = {
      id = sessionId;
      userId = caller;
      cart;
      totalAmount;
      paymentMethod;
      status = "pending";
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    checkoutSessions := textMap.put(checkoutSessions, sessionId, checkoutSession);
    sessionId;
  };

  public query ({ caller }) func getCheckoutSessions() : async [CheckoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view checkout sessions");
    };
    let userSessions = Array.filter<CheckoutSession>(
      Iter.toArray(textMap.vals(checkoutSessions)),
      func(session : CheckoutSession) : Bool {
        session.userId == caller;
      },
    );
    userSessions;
  };

  public query ({ caller }) func getCheckoutSessionById(sessionId : Text) : async ?CheckoutSession {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view checkout sessions");
    };
    switch (textMap.get(checkoutSessions, sessionId)) {
      case null { null };
      case (?session) {
        if (session.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Cannot access other users' checkout sessions");
        };
        ?session;
      };
    };
  };

  public shared ({ caller }) func updateCheckoutSession(sessionId : Text, updatedSession : CheckoutSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update checkout sessions");
    };

    switch (textMap.get(checkoutSessions, sessionId)) {
      case null {
        Debug.trap("Checkout session not found");
      };
      case (?session) {
        if (session.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Cannot update other users' checkout sessions");
        };
        checkoutSessions := textMap.put(checkoutSessions, sessionId, updatedSession);
      };
    };
  };

  public shared ({ caller }) func deleteCheckoutSession(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete checkout sessions");
    };

    switch (textMap.get(checkoutSessions, sessionId)) {
      case null {
        Debug.trap("Checkout session not found");
      };
      case (?session) {
        if (session.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Cannot delete other users' checkout sessions");
        };
        checkoutSessions := textMap.remove(checkoutSessions, sessionId).0;
      };
    };
  };

  public shared ({ caller }) func processPayment(amount : Nat, vendor : Text, paymentMethod : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can process payments");
    };

    let transactionId = Text.concat("payment-", Nat.toText(Int.abs(Time.now())));
    let paymentTransaction : PaymentTransaction = {
      id = transactionId;
      userId = caller;
      amount;
      vendor;
      paymentMethod;
      status = "pending";
      timestamp = Time.now();
      errorMessage = null;
    };

    paymentTransactions := textMap.put(paymentTransactions, transactionId, paymentTransaction);
    transactionId;
  };

  public query ({ caller }) func getPaymentTransactions() : async [PaymentTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view payment transactions");
    };
    let userTransactions = Array.filter<PaymentTransaction>(
      Iter.toArray(textMap.vals(paymentTransactions)),
      func(transaction : PaymentTransaction) : Bool {
        transaction.userId == caller;
      },
    );
    userTransactions;
  };

  public query ({ caller }) func getPaymentTransactionById(transactionId : Text) : async ?PaymentTransaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view payment transactions");
    };
    switch (textMap.get(paymentTransactions, transactionId)) {
      case null { null };
      case (?transaction) {
        if (transaction.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Cannot access other users' payment transactions");
        };
        ?transaction;
      };
    };
  };

  public shared ({ caller }) func updatePaymentTransaction(transactionId : Text, updatedTransaction : PaymentTransaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update payment transactions");
    };

    switch (textMap.get(paymentTransactions, transactionId)) {
      case null {
        Debug.trap("Payment transaction not found");
      };
      case (?_transaction) {
        paymentTransactions := textMap.put(paymentTransactions, transactionId, updatedTransaction);
      };
    };
  };

  public shared ({ caller }) func deletePaymentTransaction(transactionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete payment transactions");
    };

    switch (textMap.get(paymentTransactions, transactionId)) {
      case null {
        Debug.trap("Payment transaction not found");
      };
      case (?_transaction) {
        paymentTransactions := textMap.remove(paymentTransactions, transactionId).0;
      };
    };
  };

  public shared ({ caller }) func logTransparencyAction(action : Text, dataHash : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can log transparency actions");
    };

    let logId = Text.concat("log-", Nat.toText(Int.abs(Time.now())));
    let transparencyLog : TransparencyLog = {
      id = logId;
      userId = caller;
      action;
      dataHash;
      timestamp = Time.now();
      status;
    };

    transparencyLogs := textMap.put(transparencyLogs, logId, transparencyLog);
  };

  public query ({ caller }) func getTransparencyLogs() : async [TransparencyLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view all transparency logs");
    };
    Iter.toArray(textMap.vals(transparencyLogs));
  };

  public shared ({ caller }) func recordPerformanceMetric(canister : Text, metricType : Text, value : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can record performance metrics");
    };

    let metricId = Text.concat("metric-", Nat.toText(Int.abs(Time.now())));
    let performanceMetric : PerformanceMetric = {
      id = metricId;
      canister;
      metricType;
      value;
      timestamp = Time.now();
    };

    performanceMetrics := textMap.put(performanceMetrics, metricId, performanceMetric);
  };

  public query ({ caller }) func getPerformanceMetrics() : async [PerformanceMetric] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view performance metrics");
    };
    Iter.toArray(textMap.vals(performanceMetrics));
  };

  public shared ({ caller }) func submitCommunityProposal(title : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can submit community proposals");
    };

    let proposalId = Text.concat("proposal-", Nat.toText(Int.abs(Time.now())));
    let proposal : CommunityProposal = {
      id = proposalId;
      title;
      description;
      proposer = caller;
      votes = 0;
      status = "pending";
      createdAt = Time.now();
    };

    communityProposals := textMap.put(communityProposals, proposalId, proposal);
  };

  public query ({ caller }) func getCommunityProposals() : async [CommunityProposal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view community proposals");
    };
    Iter.toArray(textMap.vals(communityProposals));
  };

  public shared ({ caller }) func voteOnProposal(proposalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can vote on proposals");
    };

    switch (textMap.get(communityProposals, proposalId)) {
      case null {
        Debug.trap("Proposal not found");
      };
      case (?proposal) {
        let updatedProposal = {
          proposal with
          votes = proposal.votes + 1;
        };
        communityProposals := textMap.put(communityProposals, proposalId, updatedProposal);
      };
    };
  };

  public shared ({ caller }) func submitZKProof(proofData : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can submit ZK proofs");
    };

    let proofId = Text.concat("zkproof-", Nat.toText(Int.abs(Time.now())));
    let zkProof : ZKProof = {
      id = proofId;
      userId = caller;
      proofData;
      timestamp = Time.now();
      verified = false;
    };

    zkProofs := textMap.put(zkProofs, proofId, zkProof);
  };

  public query ({ caller }) func getZKProofs() : async [ZKProof] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view all ZK proofs");
    };
    Iter.toArray(textMap.vals(zkProofs));
  };

  public shared ({ caller }) func addPartnerIntegration(partnerName : Text, integrationType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add partner integrations");
    };

    let integrationId = Text.concat("partner-", Nat.toText(Int.abs(Time.now())));
    let partnerIntegration : PartnerIntegration = {
      id = integrationId;
      partnerName;
      integrationType;
      status = "active";
      createdAt = Time.now();
    };

    partnerIntegrations := textMap.put(partnerIntegrations, integrationId, partnerIntegration);
  };

  public query ({ caller }) func getPartnerIntegrations() : async [PartnerIntegration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view partner integrations");
    };
    Iter.toArray(textMap.vals(partnerIntegrations));
  };

  public shared ({ caller }) func recordAnalyticsAggregate(metricType : Text, value : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can record analytics aggregates");
    };

    let aggregateId = Text.concat("aggregate-", Nat.toText(Int.abs(Time.now())));
    let analyticsAggregate : AnalyticsAggregate = {
      id = aggregateId;
      metricType;
      value;
      timestamp = Time.now();
    };

    analyticsAggregates := textMap.put(analyticsAggregates, aggregateId, analyticsAggregate);
  };

  public query ({ caller }) func getAnalyticsAggregates() : async [AnalyticsAggregate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view analytics aggregates");
    };
    Iter.toArray(textMap.vals(analyticsAggregates));
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can check Stripe configuration");
    };
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can get Stripe session status");
    };
    switch (stripeConfig) {
      case null {
        Debug.trap("Stripe configuration not set");
      };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  public shared ({ caller }) func createWhitePaperDocument(title : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create white paper documents");
    };

    let documentId = Text.concat("whitepaper-", Nat.toText(Int.abs(Time.now())));
    let whitePaperDocument : WhitePaperDocument = {
      id = documentId;
      title;
      sections = [];
      createdAt = Time.now();
      updatedAt = Time.now();
      version = 1;
      status = "draft";
    };

    whitePaperDocuments := textMap.put(whitePaperDocuments, documentId, whitePaperDocument);
    documentId;
  };

  public shared ({ caller }) func addWhitePaperSection(documentId : Text, section : WhitePaperSection) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add white paper sections");
    };

    switch (textMap.get(whitePaperDocuments, documentId)) {
      case null {
        Debug.trap("White paper document not found");
      };
      case (?document) {
        let updatedSections = Array.append(document.sections, [section]);
        let updatedDocument = {
          document with
          sections = updatedSections;
          updatedAt = Time.now();
          version = document.version + 1;
        };
        whitePaperDocuments := textMap.put(whitePaperDocuments, documentId, updatedDocument);
      };
    };
  };

  public shared ({ caller }) func updateWhitePaperSection(documentId : Text, sectionId : Text, updatedSection : WhitePaperSection) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update white paper sections");
    };

    switch (textMap.get(whitePaperDocuments, documentId)) {
      case null {
        Debug.trap("White paper document not found");
      };
      case (?document) {
        let updatedSections = Array.map<WhitePaperSection, WhitePaperSection>(
          document.sections,
          func(s : WhitePaperSection) : WhitePaperSection {
            if (s.id == sectionId) { updatedSection } else { s };
          },
        );
        let updatedDocument = {
          document with
          sections = updatedSections;
          updatedAt = Time.now();
          version = document.version + 1;
        };
        whitePaperDocuments := textMap.put(whitePaperDocuments, documentId, updatedDocument);
      };
    };
  };

  public shared ({ caller }) func deleteWhitePaperSection(documentId : Text, sectionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete white paper sections");
    };

    switch (textMap.get(whitePaperDocuments, documentId)) {
      case null {
        Debug.trap("White paper document not found");
      };
      case (?document) {
        let filteredSections = Array.filter<WhitePaperSection>(
          document.sections,
          func(section : WhitePaperSection) : Bool {
            section.id != sectionId;
          },
        );
        let updatedDocument = {
          document with
          sections = filteredSections;
          updatedAt = Time.now();
          version = document.version + 1;
        };
        whitePaperDocuments := textMap.put(whitePaperDocuments, documentId, updatedDocument);
      };
    };
  };

  public query ({ caller }) func getWhitePaperDocument(documentId : Text) : async ?WhitePaperDocument {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view white paper documents");
    };
    textMap.get(whitePaperDocuments, documentId);
  };

  public query ({ caller }) func getAllWhitePaperDocuments() : async [WhitePaperDocument] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view white paper documents");
    };
    Iter.toArray(textMap.vals(whitePaperDocuments));
  };

  public shared ({ caller }) func updateWhitePaperStatus(documentId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update white paper status");
    };

    switch (textMap.get(whitePaperDocuments, documentId)) {
      case null {
        Debug.trap("White paper document not found");
      };
      case (?document) {
        let updatedDocument = {
          document with
          status;
          updatedAt = Time.now();
          version = document.version + 1;
        };
        whitePaperDocuments := textMap.put(whitePaperDocuments, documentId, updatedDocument);
      };
    };
  };

  public shared ({ caller }) func deleteWhitePaperDocument(documentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete white paper documents");
    };

    switch (textMap.get(whitePaperDocuments, documentId)) {
      case null {
        Debug.trap("White paper document not found");
      };
      case (?_document) {
        whitePaperDocuments := textMap.remove(whitePaperDocuments, documentId).0;
      };
    };
  };

  // Sprint 1: AI Memory Profile Functions
  public shared ({ caller }) func saveAIMemoryProfile(profile : AIMemoryProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save AI memory profiles");
    };
    if (profile.userId != caller) {
      Debug.trap("Unauthorized: Can only save your own AI memory profile");
    };
    aiMemoryProfiles := principalMap.put(aiMemoryProfiles, caller, profile);
  };

  public query ({ caller }) func getAIMemoryProfile() : async ?AIMemoryProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view AI memory profiles");
    };
    principalMap.get(aiMemoryProfiles, caller);
  };

  public shared ({ caller }) func addDomainAgent(agent : DomainAgent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add domain agents");
    };
    if (agent.userId != caller) {
      Debug.trap("Unauthorized: Can only add domain agents for yourself");
    };
    let userAgents = switch (principalMap.get(domainAgents, caller)) {
      case null { [] };
      case (?existingAgents) { existingAgents };
    };
    domainAgents := principalMap.put(domainAgents, caller, Array.append(userAgents, [agent]));
  };

  public query ({ caller }) func getDomainAgents() : async [DomainAgent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view domain agents");
    };
    switch (principalMap.get(domainAgents, caller)) {
      case null { [] };
      case (?userAgents) { userAgents };
    };
  };

  public shared ({ caller }) func addCoachingSession(session : CoachingSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add coaching sessions");
    };
    if (session.userId != caller) {
      Debug.trap("Unauthorized: Can only add coaching sessions for yourself");
    };
    let userSessions = switch (principalMap.get(coachingSessions, caller)) {
      case null { [] };
      case (?existingSessions) { existingSessions };
    };
    coachingSessions := principalMap.put(coachingSessions, caller, Array.append(userSessions, [session]));
  };

  public query ({ caller }) func getCoachingSessions() : async [CoachingSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view coaching sessions");
    };
    switch (principalMap.get(coachingSessions, caller)) {
      case null { [] };
      case (?userSessions) { userSessions };
    };
  };

  // Sprint 2: Protocol Builder Functions
  public shared ({ caller }) func createHealthProtocol(protocol : HealthProtocol) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create health protocols");
    };
    if (protocol.userId != caller and protocol.createdBy != caller) {
      Debug.trap("Unauthorized: Can only create protocols for yourself");
    };
    healthProtocols := textMap.put(healthProtocols, protocol.id, protocol);
  };

  public query ({ caller }) func getHealthProtocol(protocolId : Text) : async ?HealthProtocol {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view health protocols");
    };
    switch (textMap.get(healthProtocols, protocolId)) {
      case null { null };
      case (?protocol) {
        if (protocol.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Cannot access other users' protocols");
        };
        ?protocol;
      };
    };
  };

  public query ({ caller }) func getUserHealthProtocols() : async [HealthProtocol] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view health protocols");
    };
    let userProtocols = Array.filter<HealthProtocol>(
      Iter.toArray(textMap.vals(healthProtocols)),
      func(protocol : HealthProtocol) : Bool {
        protocol.userId == caller;
      },
    );
    userProtocols;
  };

  public shared ({ caller }) func createProfessionalAccessToken(token : ProfessionalAccessToken) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create professional access tokens");
    };
    if (token.userId != caller) {
      Debug.trap("Unauthorized: Can only create tokens for your own data");
    };
    professionalAccessTokens := textMap.put(professionalAccessTokens, token.tokenId, token);
  };

  public query ({ caller }) func getProfessionalAccessToken(tokenId : Text) : async ?ProfessionalAccessToken {
    switch (textMap.get(professionalAccessTokens, tokenId)) {
      case null { null };
      case (?token) {
        if (token.professionalId != caller and token.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Cannot access this token");
        };
        if (Time.now() > token.expiresAt or not token.active) {
          Debug.trap("Token expired or inactive");
        };
        ?token;
      };
    };
  };

  public shared ({ caller }) func revokeProfessionalAccessToken(tokenId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can revoke professional access tokens");
    };
    switch (textMap.get(professionalAccessTokens, tokenId)) {
      case null {
        Debug.trap("Token not found");
      };
      case (?token) {
        if (token.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Can only revoke your own tokens");
        };
        let updatedToken = { token with active = false };
        professionalAccessTokens := textMap.put(professionalAccessTokens, tokenId, updatedToken);
      };
    };
  };

  public shared ({ caller }) func updateProtocolProgress(progress : ProtocolProgress) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update protocol progress");
    };
    if (progress.userId != caller) {
      Debug.trap("Unauthorized: Can only update your own protocol progress");
    };
    protocolProgress := textMap.put(protocolProgress, progress.protocolId, progress);
  };

  public query ({ caller }) func getProtocolProgress(protocolId : Text) : async ?ProtocolProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view protocol progress");
    };
    switch (textMap.get(protocolProgress, protocolId)) {
      case null { null };
      case (?progress) {
        if (progress.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Cannot access other users' protocol progress");
        };
        ?progress;
      };
    };
  };

  // Sprint 3: Notification System Functions
  public shared ({ caller }) func saveNotificationPreferences(preferences : NotificationPreference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save notification preferences");
    };
    if (preferences.userId != caller) {
      Debug.trap("Unauthorized: Can only save your own notification preferences");
    };
    notificationPreferences := principalMap.put(notificationPreferences, caller, preferences);
  };

  public query ({ caller }) func getNotificationPreferences() : async ?NotificationPreference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view notification preferences");
    };
    principalMap.get(notificationPreferences, caller);
  };

  public shared ({ caller }) func scheduleNotification(notification : ScheduledNotification) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can schedule notifications");
    };
    scheduledNotifications := textMap.put(scheduledNotifications, notification.id, notification);
  };

  public query ({ caller }) func getScheduledNotifications() : async [ScheduledNotification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view scheduled notifications");
    };
    let userNotifications = Array.filter<ScheduledNotification>(
      Iter.toArray(textMap.vals(scheduledNotifications)),
      func(notification : ScheduledNotification) : Bool {
        notification.userId == caller;
      },
    );
    userNotifications;
  };

  // Sprint 4: Analytics & Grant Reporting Functions
  public shared ({ caller }) func recordGrantKPI(kpi : GrantKPI) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can record grant KPIs");
    };
    grantKPIs := textMap.put(grantKPIs, kpi.id, kpi);
  };

  public query ({ caller }) func getGrantKPIs() : async [GrantKPI] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view grant KPIs");
    };
    Iter.toArray(textMap.vals(grantKPIs));
  };

  public shared ({ caller }) func recordSystemMetric(metric : SystemMetric) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can record system metrics");
    };
    systemMetrics := textMap.put(systemMetrics, metric.id, metric);
  };

  public query ({ caller }) func getSystemMetrics() : async [SystemMetric] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view system metrics");
    };
    Iter.toArray(textMap.vals(systemMetrics));
  };

  public query func getPublicSystemMetrics() : async [SystemMetric] {
    Iter.toArray(textMap.vals(systemMetrics));
  };
};
