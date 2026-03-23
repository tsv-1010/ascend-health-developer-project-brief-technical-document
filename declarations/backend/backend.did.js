export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const AgentInteraction = IDL.Record({
    'message' : IDL.Text,
    'response' : IDL.Text,
    'timestamp' : Time,
  });
  const Badge = IDL.Record({
    'id' : IDL.Text,
    'dateEarned' : Time,
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const ExtractedField = IDL.Record({
    'domain' : IDL.Text,
    'value' : IDL.Text,
    'source' : IDL.Text,
    'indicator' : IDL.Text,
    'confidence' : IDL.Nat,
    'fieldName' : IDL.Text,
  });
  const HealthIndicator = IDL.Record({
    'value' : IDL.Nat,
    'source' : IDL.Text,
    'name' : IDL.Text,
    'unit' : IDL.Text,
    'timestamp' : Time,
  });
  const HealthDomain = IDL.Variant({
    'mental' : IDL.Null,
    'longevity' : IDL.Null,
    'community' : IDL.Null,
    'fitness' : IDL.Null,
    'environment' : IDL.Null,
    'purpose' : IDL.Null,
    'nutrition' : IDL.Null,
    'finances' : IDL.Null,
  });
  const LeaderboardEntry = IDL.Record({
    'domain' : HealthDomain,
    'userId' : IDL.Text,
    'score' : IDL.Nat,
  });
  const Notification = IDL.Record({
    'id' : IDL.Text,
    'read' : IDL.Bool,
    'type' : IDL.Text,
    'message' : IDL.Text,
    'dateSent' : Time,
  });
  const Product = IDL.Record({
    'id' : IDL.Text,
    'protocol' : IDL.Text,
    'name' : IDL.Text,
    'recommended' : IDL.Bool,
    'description' : IDL.Text,
    'aiInfo' : IDL.Text,
    'vendor' : IDL.Text,
    'category' : IDL.Text,
    'price' : IDL.Nat,
    'ranking' : IDL.Nat,
  });
  const Reward = IDL.Record({
    'id' : IDL.Text,
    'type' : IDL.Text,
    'dateAwarded' : Time,
    'amount' : IDL.Nat,
  });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const CustomMetric = IDL.Record({
    'id' : IDL.Text,
    'domain' : HealthDomain,
    'value' : IDL.Nat,
    'name' : IDL.Text,
    'createdAt' : Time,
  });
  const Referral = IDL.Record({
    'referrer' : IDL.Principal,
    'rewardClaimed' : IDL.Bool,
    'code' : IDL.Text,
    'timestamp' : Time,
    'referee' : IDL.Opt(IDL.Principal),
  });
  const BrandSuggestion = IDL.Record({
    'userEmail' : IDL.Text,
    'timestamp' : Time,
    'category' : IDL.Text,
    'brandName' : IDL.Text,
    'reviewed' : IDL.Bool,
    'reason' : IDL.Opt(IDL.Text),
  });
  const UserProfile = IDL.Record({
    'age' : IDL.Nat,
    'name' : IDL.Text,
    'onboardingComplete' : IDL.Bool,
    'agentName' : IDL.Text,
    'subscriptionStatus' : IDL.Bool,
    'goals' : IDL.Vec(IDL.Text),
    'healthConcerns' : IDL.Vec(IDL.Text),
    'privacyConsent' : IDL.Bool,
  });
  const CheckoutSession = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'paymentMethod' : IDL.Text,
    'cart' : IDL.Vec(Product),
    'userId' : IDL.Principal,
    'createdAt' : Time,
    'updatedAt' : Time,
    'totalAmount' : IDL.Nat,
  });
  const DashboardPreference = IDL.Record({
    'notificationPreferences' : IDL.Vec(IDL.Text),
    'hiddenCards' : IDL.Vec(IDL.Text),
    'userId' : IDL.Principal,
    'lastUpdated' : Time,
    'cardOrder' : IDL.Vec(IDL.Text),
  });
  const DomainProgress = IDL.Record({
    'streak' : IDL.Nat,
    'lastUpdated' : Time,
    'score' : IDL.Nat,
  });
  const FileReference = IDL.Record({ 'hash' : IDL.Text, 'path' : IDL.Text });
  const HealthRecord = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'userId' : IDL.Principal,
    'filePath' : IDL.Text,
    'extractedData' : IDL.Opt(IDL.Vec(ExtractedField)),
    'reviewStatus' : IDL.Text,
    'fileType' : IDL.Text,
    'uploadTime' : Time,
  });
  const HelpPreference = IDL.Record({
    'userId' : IDL.Principal,
    'lastUpdated' : Time,
    'showHelp' : IDL.Bool,
    'completedTutorials' : IDL.Vec(IDL.Text),
  });
  const LiquidityPool = IDL.Record({
    'id' : IDL.Text,
    'apy' : IDL.Nat,
    'totalLiquidity' : IDL.Nat,
    'volume' : IDL.Nat,
    'tokenPair' : IDL.Text,
  });
  const PaymentTransaction = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'paymentMethod' : IDL.Text,
    'userId' : IDL.Principal,
    'errorMessage' : IDL.Opt(IDL.Text),
    'vendor' : IDL.Text,
    'timestamp' : Time,
    'amount' : IDL.Nat,
  });
  const PromptSuggestion = IDL.Record({
    'id' : IDL.Text,
    'context' : IDL.Text,
    'usageCount' : IDL.Nat,
    'prompt' : IDL.Text,
    'lastUsed' : Time,
  });
  const QuickAction = IDL.Record({
    'id' : IDL.Text,
    'action' : IDL.Text,
    'context' : IDL.Text,
    'usageCount' : IDL.Nat,
    'lastUsed' : Time,
  });
  const StakingPosition = IDL.Record({
    'startTime' : Time,
    'active' : IDL.Bool,
    'userId' : IDL.Principal,
    'amount' : IDL.Nat,
    'lockupPeriod' : IDL.Nat,
    'rewardMultiplier' : IDL.Nat,
  });
  const TourStep = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'order' : IDL.Nat,
    'completed' : IDL.Bool,
    'description' : IDL.Text,
    'target' : IDL.Text,
  });
  const TourProgress = IDL.Record({
    'userId' : IDL.Principal,
    'completed' : IDL.Bool,
    'lastUpdated' : Time,
    'steps' : IDL.Vec(TourStep),
  });
  const UploadStatus = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'userId' : IDL.Principal,
    'errorMessage' : IDL.Opt(IDL.Text),
    'filePath' : IDL.Text,
    'progress' : IDL.Nat,
    'timestamp' : Time,
  });
  const WearableConnection = IDL.Record({
    'service' : IDL.Text,
    'expiresAt' : IDL.Opt(Time),
    'refreshToken' : IDL.Opt(IDL.Text),
    'connectedAt' : Time,
    'accessToken' : IDL.Text,
  });
  const http_header = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const http_request_result = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  const TransformationInput = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : http_request_result,
  });
  const TransformationOutput = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  return IDL.Service({
    'addAgentInteraction' : IDL.Func([AgentInteraction], [], []),
    'addBadge' : IDL.Func([Badge], [], []),
    'addExtractedData' : IDL.Func([IDL.Text, IDL.Vec(ExtractedField)], [], []),
    'addHealthIndicator' : IDL.Func([HealthIndicator], [], []),
    'addLeaderboardEntry' : IDL.Func([LeaderboardEntry], [], []),
    'addNotification' : IDL.Func([Notification], [], []),
    'addProduct' : IDL.Func([Product], [], []),
    'addReward' : IDL.Func([Reward], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'claimReferralReward' : IDL.Func([IDL.Text], [], []),
    'completeOnboarding' : IDL.Func([], [], []),
    'connectWearable' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(Time)],
        [],
        [],
      ),
    'createCheckoutSession' : IDL.Func(
        [IDL.Vec(Product), IDL.Nat, IDL.Text],
        [IDL.Text],
        [],
      ),
    'createCustomMetric' : IDL.Func([CustomMetric], [], []),
    'createReferral' : IDL.Func([IDL.Text], [], []),
    'deleteCheckoutSession' : IDL.Func([IDL.Text], [], []),
    'deleteHealthRecord' : IDL.Func([IDL.Text], [], []),
    'deletePaymentTransaction' : IDL.Func([IDL.Text], [], []),
    'deleteProduct' : IDL.Func([IDL.Text], [], []),
    'deleteUploadStatus' : IDL.Func([IDL.Text], [], []),
    'dropFileReference' : IDL.Func([IDL.Text], [], []),
    'getAgentInteractions' : IDL.Func(
        [],
        [IDL.Vec(AgentInteraction)],
        ['query'],
      ),
    'getAllReferrals' : IDL.Func([], [IDL.Vec(Referral)], ['query']),
    'getBadges' : IDL.Func([], [IDL.Vec(Badge)], ['query']),
    'getBrandSuggestions' : IDL.Func([], [IDL.Vec(BrandSuggestion)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCheckoutSessionById' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(CheckoutSession)],
        ['query'],
      ),
    'getCheckoutSessions' : IDL.Func([], [IDL.Vec(CheckoutSession)], ['query']),
    'getCustomMetrics' : IDL.Func([], [IDL.Vec(CustomMetric)], ['query']),
    'getDashboardPreferences' : IDL.Func(
        [],
        [IDL.Opt(DashboardPreference)],
        ['query'],
      ),
    'getDomainProgress' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(HealthDomain, DomainProgress))],
        ['query'],
      ),
    'getFileReference' : IDL.Func([IDL.Text], [FileReference], ['query']),
    'getHealthIndicators' : IDL.Func([], [IDL.Vec(HealthIndicator)], ['query']),
    'getHealthRecordById' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(HealthRecord)],
        ['query'],
      ),
    'getHealthRecords' : IDL.Func([], [IDL.Vec(HealthRecord)], ['query']),
    'getHelpPreferences' : IDL.Func([], [IDL.Opt(HelpPreference)], ['query']),
    'getLeaderboard' : IDL.Func([], [IDL.Vec(LeaderboardEntry)], ['query']),
    'getLiquidityPools' : IDL.Func([], [IDL.Vec(LiquidityPool)], ['query']),
    'getNotifications' : IDL.Func([], [IDL.Vec(Notification)], ['query']),
    'getPaymentTransactionById' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(PaymentTransaction)],
        ['query'],
      ),
    'getPaymentTransactions' : IDL.Func(
        [],
        [IDL.Vec(PaymentTransaction)],
        ['query'],
      ),
    'getProductById' : IDL.Func([IDL.Text], [IDL.Opt(Product)], ['query']),
    'getProducts' : IDL.Func([], [IDL.Vec(Product)], ['query']),
    'getPromptSuggestions' : IDL.Func(
        [],
        [IDL.Vec(PromptSuggestion)],
        ['query'],
      ),
    'getQuickActions' : IDL.Func([], [IDL.Vec(QuickAction)], ['query']),
    'getReferral' : IDL.Func([IDL.Text], [IDL.Opt(Referral)], ['query']),
    'getRewards' : IDL.Func([], [IDL.Vec(Reward)], ['query']),
    'getStakingPositions' : IDL.Func([], [IDL.Vec(StakingPosition)], ['query']),
    'getTourProgress' : IDL.Func([], [IDL.Opt(TourProgress)], ['query']),
    'getUploadStatusById' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(UploadStatus)],
        ['query'],
      ),
    'getUploadStatuses' : IDL.Func([], [IDL.Vec(UploadStatus)], ['query']),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'getWearableConnections' : IDL.Func(
        [],
        [IDL.Vec(WearableConnection)],
        ['query'],
      ),
    'initializeAccessControl' : IDL.Func([], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'isOnboardingComplete' : IDL.Func([], [IDL.Bool], ['query']),
    'listFileReferences' : IDL.Func([], [IDL.Vec(FileReference)], ['query']),
    'processPayment' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [IDL.Text], []),
    'registerFileReference' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'saveDashboardPreferences' : IDL.Func([DashboardPreference], [], []),
    'saveHelpPreferences' : IDL.Func([HelpPreference], [], []),
    'savePromptSuggestions' : IDL.Func([IDL.Vec(PromptSuggestion)], [], []),
    'saveQuickActions' : IDL.Func([IDL.Vec(QuickAction)], [], []),
    'saveTourProgress' : IDL.Func([TourProgress], [], []),
    'stakeTokens' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'submitBrandSuggestion' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Text],
        [],
        [],
      ),
    'transform' : IDL.Func(
        [TransformationInput],
        [TransformationOutput],
        ['query'],
      ),
    'unstakeTokens' : IDL.Func([IDL.Nat], [], []),
    'updateCheckoutSession' : IDL.Func([IDL.Text, CheckoutSession], [], []),
    'updateDomainProgress' : IDL.Func([HealthDomain, DomainProgress], [], []),
    'updateLiquidityPools' : IDL.Func([], [], []),
    'updatePaymentTransaction' : IDL.Func(
        [IDL.Text, PaymentTransaction],
        [],
        [],
      ),
    'updateProduct' : IDL.Func([IDL.Text, Product], [], []),
    'updateReviewStatus' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'updateUploadStatus' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)],
        [],
        [],
      ),
    'uploadHealthRecord' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
