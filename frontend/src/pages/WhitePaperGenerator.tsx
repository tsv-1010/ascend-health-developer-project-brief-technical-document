import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useGetAllWhitePaperDocuments, 
  useCreateWhitePaperDocument, 
  useAddWhitePaperSection,
  useUpdateWhitePaperSection,
  useDeleteWhitePaperSection,
  useUpdateWhitePaperStatus,
  useDeleteWhitePaperDocument
} from '../hooks/useQueries';
import { WhitePaperDocument, WhitePaperSection } from '../backend';
import { 
  FileText, 
  Plus, 
  Save, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Image as ImageIcon,
  BarChart3,
  Users,
  Shield,
  Coins,
  Zap,
  FileCheck,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';

const WhitePaperGenerator: React.FC = () => {
  const { data: documents = [], isLoading } = useGetAllWhitePaperDocuments();
  const createDocument = useCreateWhitePaperDocument();
  const addSection = useAddWhitePaperSection();
  const updateSection = useUpdateWhitePaperSection();
  const deleteSection = useDeleteWhitePaperSection();
  const updateStatus = useUpdateWhitePaperStatus();
  const deleteDocument = useDeleteWhitePaperDocument();

  const [selectedDocument, setSelectedDocument] = useState<WhitePaperDocument | null>(null);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [editingSection, setEditingSection] = useState<WhitePaperSection | null>(null);
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    order: 1
  });
  const [activeTab, setActiveTab] = useState('documents');

  const sectionTemplates = [
    {
      id: 'executive-abstract',
      title: 'Executive Abstract',
      icon: FileText,
      content: `# Executive Abstract

## Vision Statement
Ascend Health merges decentralized AI, DeFi, and health verification to create Proof of Vitality—a verifiable wellness index built on the Internet Computer.

## Problem Statement
Current health data is fragmented across wearables, labs, and medical records with no unified verification system. Users lack ownership and control over their health data, and there's no incentive mechanism for maintaining healthy behaviors.

## Solution Overview
Ascend Health provides:
- **Proof of Vitality**: Cryptographically verified health data submissions
- **On-Chain AI Processing**: Privacy-preserving health insights using ICP-native LLM
- **Token Incentives**: Ascend token rewards for verified health proofs
- **Decentralized Storage**: User-controlled health data with HIPAA-grade privacy

## Mission Alignment with DFINITY Ecosystem
Built entirely on the Internet Computer, leveraging:
- Chain Fusion for cross-chain interoperability
- ICP-native AI for on-chain computation
- Decentralized storage for health records
- Internet Identity for secure authentication

Visual references: ascend-health-logo.png, health-orb-central.png`
    },
    {
      id: 'technical-architecture',
      title: 'Technical Architecture',
      icon: BarChart3,
      content: `# Technical Architecture

## Motoko Canister Ecosystem

### Core Canisters
1. **AscendHealth Canister**: Main application logic, user profiles, domain progress
2. **ProofOfLife Canister**: Health data verification and proof generation
3. **Registry Canister**: Blob storage for encrypted health records
4. **DeFi/Staking Canister**: Token economics and staking mechanisms
5. **AI Outcalls Canister**: ICP-native LLM integration

## Data Flow Pipeline
\`\`\`
User Data → Hash → Proof → Verification → Reward → Token Economy
\`\`\`

### Privacy-First Architecture
- All health data is hashed before storage
- Only normalized data sent to AI processing
- Zero-knowledge proof preparation for future upgrades
- Encrypted blob storage for medical documents

## On-Chain LLM Integration
- Canister ID: w36hm-eqaaa-aaal-qr76a-cai
- Privacy-preserving prompts with normalized data only
- Real-time performance monitoring
- HIPAA-compliant processing

## Encryption Primitives
- SHA-256 hashing for health data
- AES-256 encryption for blob storage
- OAuth2 token encryption for wearable connections
- Principal-based access control

Visual references: agent-llm-processing.dim_800x600.png, proof-submission-interface.png, defi-dashboard.png`
    },
    {
      id: 'proof-mechanism',
      title: 'Proof Generation & Verification',
      icon: Shield,
      content: `# Proof Generation & Verification Mechanism

## Health Data Submission Pipeline

### Step 1: Data Collection
Users submit daily health metrics:
- Steps (target: 10,000+)
- Protein intake (target: 100g+)
- Sleep hours (target: 7+)
- Lab results from wearables and medical records

### Step 2: Hash Generation
\`\`\`
healthDataHash = SHA256(steps + protein + sleep + timestamp)
\`\`\`

### Step 3: Threshold Verification
Proofs are verified against minimum thresholds:
- All three metrics must meet targets
- Timestamp must be within 24 hours
- No duplicate submissions allowed

### Step 4: Token Reward Distribution
- Verified proof: 10 Ascend tokens
- Failed proof: 0 tokens (but recorded for streak tracking)
- Bonus multipliers for consecutive days

## Zero-Knowledge Verification Roadmap

### Phase 1 (Current): Hash-Based Proofs
- Cryptographic hashing for privacy
- On-chain verification
- Public proof history with anonymized data

### Phase 2 (Q2 2025): ZK-SNARK Integration
- Zero-knowledge proof generation
- Verifiable computation without revealing data
- Enhanced privacy guarantees

### Phase 3 (Q3 2025): Confidential Computing
- Trusted execution environments
- Encrypted computation
- Multi-party computation for group health metrics

Visual references: proof-history-dashboard.png, proof-submission-interface.png, zk-proof-submission.png`
    },
    {
      id: 'ai-feedback-loop',
      title: 'AI-Driven Feedback Loop',
      icon: Zap,
      content: `# AI-Driven Feedback Loop

## On-Chain AI Processing Architecture

### ICP-Native LLM Integration
- **Canister**: w36hm-eqaaa-aaal-qr76a-cai
- **Model**: Optimized for health insights
- **Privacy**: Only normalized/hashed data processed
- **Performance**: <2s response time, monitored cycles usage

## Modular AI Agent Roles

### Domain-Specific Agents
1. **Fitness Agent**: Workout optimization, recovery tracking
2. **Nutrition Agent**: Meal planning, macro tracking
3. **Mental Health Agent**: Stress management, sleep optimization
4. **Finance Agent**: Portfolio analysis, DeFi strategies
5. **Longevity Agent**: Biomarker interpretation, anti-aging protocols
6. **Purpose Agent**: Goal setting, productivity optimization
7. **Environment Agent**: Air quality, sustainability tracking
8. **Community Agent**: Social connection, support networks

## Feedback Cycle

### Data → Proof → AI Plan → Action → Proof
1. **Data Collection**: Wearables, labs, manual entries
2. **Proof Generation**: Cryptographic verification
3. **AI Analysis**: On-chain LLM processing with normalized data
4. **Personalized Plan**: Domain-specific recommendations
5. **Action Tracking**: User follows recommendations
6. **New Proof**: Verify improvement and reward progress

## Privacy-Preserving AI
- **Input**: Only normalized data ranges (e.g., "high", "medium", "low")
- **Processing**: On-chain computation, no external APIs
- **Output**: Actionable insights without revealing raw data
- **Compliance**: HIPAA-grade privacy maintained throughout

Visual references: ai-agent-avatar.png, context-aware-prompts.dim_800x400.png, ai-product-recommendations.dim_800x600.png`
    },
    {
      id: 'tokenomics',
      title: 'Tokenomics & Incentive System',
      icon: Coins,
      content: `# Tokenomics & Incentive System

## Ascend Token Mechanics

### Token Utility
1. **Proof Rewards**: Earn tokens for verified health proofs
2. **Staking**: Lock tokens for reward multipliers
3. **Governance**: Vote on community health protocols
4. **Marketplace**: Purchase health products and services
5. **Referrals**: Earn tokens for bringing new users

### Emission Schedule
- **Daily Proof Rewards**: 10 tokens per verified submission
- **Staking Rewards**: 5-20% APY based on lockup period
- **Referral Bonuses**: 50 tokens per successful referral
- **Milestone Achievements**: 25-100 tokens for health goals

## Staking Multipliers

| Lockup Period | Reward Multiplier | APY |
|---------------|-------------------|-----|
| 30 days       | 1x                | 5%  |
| 90 days       | 2x                | 10% |
| 180 days      | 3x                | 15% |
| 365 days      | 4x                | 20% |

## ICPSwap Liquidity Pool Mechanics

### Trading Pairs
- ASCEND/ICP
- ASCEND/USDT
- ASCEND/ckBTC

### Liquidity Provision
- Provide liquidity to earn trading fees
- Auto-compounding rewards
- Impermanent loss protection mechanisms

## Referral Structure
- **Tier 1**: 10% discount for referee, 50 tokens for referrer
- **Tier 2**: 5 successful referrals → 15% discount tier
- **Tier 3**: 10 successful referrals → 20% discount tier + bonus rewards

Visual references: ascend-staking-interface.png, ascend-token-rewards.png, liquidity-pools-widget.png, icpswap-token-swap-interface.png`
    },
    {
      id: 'privacy-security',
      title: 'Privacy, Security & Compliance',
      icon: Shield,
      content: `# Privacy, Security & Compliance

## HIPAA-Grade Privacy Architecture

### Anonymization by Hashing
- All health data hashed before storage
- SHA-256 cryptographic hashing
- No raw health values stored on-chain
- Proof verification without data exposure

### Encrypted Blob Storage
- AES-256 encryption for medical documents
- User-controlled encryption keys
- Decentralized storage on ICP
- Automatic key rotation

### Data Sovereignty
- Users own their health data
- Principal-based access control
- Granular permission management
- Right to deletion (GDPR compliant)

## User Consent Workflow

### Onboarding
1. Privacy policy acceptance
2. Data usage consent
3. Wearable connection permissions
4. AI processing opt-in

### Ongoing Control
- View all data access logs
- Revoke permissions anytime
- Export complete health history
- Delete all data with one click

## Compliance Framework

### HIPAA Compliance
- ✅ Privacy Rule: Anonymized data processing
- ✅ Security Rule: Encrypted storage and transmission
- ✅ Breach Notification: Automated alerts
- ✅ Access Controls: Principal-based authentication

### GDPR Compliance
- ✅ Right to Access: Full data export
- ✅ Right to Erasure: Complete data deletion
- ✅ Data Portability: Standard export formats
- ✅ Consent Management: Granular controls

## Zero-Knowledge Proof Upgrade Path

### Current: Hash-Based Privacy
- Cryptographic hashing
- On-chain verification
- Public proof history

### Future: ZK-SNARK Integration
- Zero-knowledge proof generation
- Verifiable computation
- Enhanced privacy guarantees

Visual references: privacy-controls-panel.png, privacy-hash-protection.png, transparency-dashboard.png`
    },
    {
      id: 'governance',
      title: 'Governance Model & Protocol Evolution',
      icon: Users,
      content: `# Governance Model & Open Protocol Evolution

## DAO-Style Governance

### Community Health Standards
- Propose new health metrics
- Vote on proof verification thresholds
- Approve new wearable integrations
- Define reward distribution rules

### Token-Weighted Voting
- 1 Ascend token = 1 vote
- Staked tokens have 2x voting power
- Proposal threshold: 1,000 tokens
- Quorum requirement: 10% of circulating supply

## Proposal System

### Proposal Types
1. **Protocol Upgrades**: Technical improvements
2. **Health Standards**: New metrics and thresholds
3. **Partnership Approvals**: Wearable and lab integrations
4. **Treasury Management**: Fund allocation decisions

### Proposal Lifecycle
1. **Draft**: Community discussion (7 days)
2. **Voting**: Token-weighted voting (14 days)
3. **Execution**: Automatic implementation if passed
4. **Review**: Post-implementation analysis

## Partnership Framework

### Wearable Device Partners
- Apple Health
- Oura Ring
- WHOOP
- Garmin
- Fitbit
- Levels CGM
- Function Health
- Eight Sleep
- Biostrap

### Lab Testing Partners
- Quest Diagnostics
- LabCorp
- Function Health
- InsideTracker
- WellnessFX

### AI Node Operators
- ICP-native LLM providers
- Decentralized AI computation
- Privacy-preserving inference
- Model training on anonymized data

## Open Protocol Evolution

### Interoperability Standards
- Health data exchange formats
- Cross-chain proof verification
- Multi-platform integration
- Open API for third-party apps

### Developer Ecosystem
- SDK for health app integration
- API documentation
- Grant program for builders
- Hackathon sponsorships

Visual references: community-portal.png, referral-dashboard-tab.png`
    },
    {
      id: 'roadmap',
      title: 'Roadmap & Implementation Timeline',
      icon: Clock,
      content: `# Roadmap & Implementation Timeline

## Phase 1: DFINITY Grant Readiness (2 weeks)

### Objectives
- Finalize Proof of Life module
- Optimize LLM integration
- Complete reward engine
- Performance monitoring dashboard

### Deliverables
- ✅ Proof verification system
- ✅ Token reward distribution
- ✅ Cycle optimization (30% reduction)
- ✅ Transparency dashboard
- ✅ Auto-generated API documentation

### Success Metrics
- Zero failed retry operations
- <2s LLM response time
- 100% API documentation coverage
- Complete data deletion workflow

## Phase 2: Closed Beta Launch (Month 1)

### Objectives
- Onboard 1,000 beta users
- Launch Proof dashboard
- Enable DeFi features
- Sync wearable data

### Deliverables
- ✅ User onboarding flow
- ✅ Proof submission interface
- ✅ Staking and rewards
- ✅ Wearable integrations (9 platforms)
- ✅ Health records upload with OCR

### Success Metrics
- 1,000 active users
- 10,000+ proof submissions
- 99% uptime
- <2s page load times

## Phase 3: Public Beta + Growth (Month 2-3)

### Objectives
- AscendPay rollout
- Community governance
- KPI dashboards
- Mobile optimization

### Deliverables
- ✅ Multi-currency payments
- ✅ Governance proposals
- ✅ Analytics dashboard
- ✅ PWA with offline mode
- ✅ Enhanced DeFi integration

### Success Metrics
- 5,000 active users
- 50,000+ proof submissions
- 100+ governance proposals
- 95% mobile satisfaction

## Phase 4: Investor Scale Phase (Month 4-6)

### Objectives
- YC/a16z traction goals
- 10K user milestone
- Verified vitality metrics
- Partnership expansion

### Deliverables
- ✅ 10,000 active users
- ✅ 100,000+ proof submissions
- ✅ 20+ wearable partnerships
- ✅ 10+ lab testing integrations
- ✅ ZK-proof infrastructure

### Success Metrics
- 10,000 active users
- $1M+ in staked tokens
- 50+ community proposals
- 95% user retention

## Long-Term Vision (Year 1+)

### Objectives
- Proof of Vitality as open standard
- Cross-chain interoperability
- Global health data network
- Decentralized AI marketplace

### Deliverables
- Open protocol specification
- Multi-chain proof verification
- AI model marketplace
- Developer ecosystem

Visual references: All roadmap and timeline visualizations`
    },
    {
      id: 'market-growth',
      title: 'Market, Growth, and Partnerships',
      icon: BarChart3,
      content: `# Market, Growth, and Partnerships

## Total Addressable Market

### Primary Market: Health-Conscious Crypto Users
- **Size**: 50M+ crypto users globally
- **Segment**: 10M+ health-focused individuals
- **Target**: 1M users in Year 1

### Secondary Market: Wearable Device Users
- **Size**: 500M+ wearable users globally
- **Segment**: 100M+ premium health trackers
- **Target**: 5M users in Year 2

### Tertiary Market: DeFi Participants
- **Size**: 10M+ DeFi users
- **Segment**: 2M+ health-interested DeFi users
- **Target**: 500K users in Year 1

## Wearable Partnership Opportunities

### Tier 1 Partners (Integrated)
- Apple Health
- Oura Ring
- WHOOP
- Garmin
- Fitbit
- Levels CGM
- Function Health
- Eight Sleep
- Biostrap

### Tier 2 Partners (Roadmap)
- Dexcom
- Abbott FreeStyle Libre
- Withings
- Polar
- Suunto
- Amazfit
- Samsung Health
- Google Fit

## ICP Ecosystem Advantages

### Chain Fusion Readiness
- Cross-chain proof verification
- Multi-chain token support
- Interoperable health data
- Unified identity across chains

### Privacy-Preserving AI
- On-chain computation
- No external API dependencies
- HIPAA-compliant processing
- User data sovereignty

### Scalability Benefits
- Unlimited storage capacity
- Sub-second finality
- Low transaction costs
- Reverse gas model

### Developer Experience
- Motoko smart contracts
- Built-in authentication
- Decentralized storage
- HTTP outcalls

## Growth Strategy

### User Acquisition
1. **Crypto Community**: Twitter, Discord, Telegram
2. **Health Influencers**: YouTube, Instagram, TikTok
3. **Wearable Users**: Device-specific communities
4. **DeFi Participants**: Yield farming, staking rewards

### Retention Mechanisms
1. **Daily Proof Rewards**: Consistent token earnings
2. **Streak Bonuses**: Multipliers for consecutive days
3. **Community Governance**: User-driven protocol
4. **Social Features**: Leaderboards, challenges

### Partnership Pipeline
- **Q1 2025**: 5 wearable integrations
- **Q2 2025**: 10 lab testing partners
- **Q3 2025**: 3 insurance partnerships
- **Q4 2025**: 5 corporate wellness programs

Visual references: enhanced-wearable-hub.png, health-shop-marketplace.png, health-labs-dashboard.png`
    },
    {
      id: 'funding-request',
      title: 'Funding Request & Grant Alignment',
      icon: Coins,
      content: `# Funding Request & Grant Alignment

## DFINITY Developer Grant: $50,000

### Technical Milestones

#### Milestone 1: Proof Verification Layer ($15,000)
- Complete Proof of Life canister
- Cryptographic hash verification
- Token reward distribution
- Integration with main canister
- **Timeline**: 2 weeks
- **Deliverable**: Functional proof system with 1,000+ submissions

#### Milestone 2: ZK-Ready Upgrade ($20,000)
- Zero-knowledge proof infrastructure
- ZK-SNARK integration preparation
- Confidential computing setup
- Privacy enhancement framework
- **Timeline**: 4 weeks
- **Deliverable**: ZK-proof architecture ready for implementation

#### Milestone 3: Community Analytics ($15,000)
- Anonymous analytics system
- Performance monitoring dashboard
- Cycle optimization tools
- Grant reporting automation
- **Timeline**: 2 weeks
- **Deliverable**: Complete analytics and monitoring suite

### Grant Alignment with DFINITY Ecosystem
- ✅ Built entirely on Internet Computer
- ✅ Leverages ICP-native AI (w36hm-eqaaa-aaal-qr76a-cai)
- ✅ Uses Internet Identity for authentication
- ✅ Implements Chain Fusion for interoperability
- ✅ Demonstrates decentralized storage
- ✅ Showcases reverse gas model benefits

## YC / a16z Acceleration: $250,000

### User Scaling ($100,000)
- Marketing and user acquisition
- Community building and engagement
- Influencer partnerships
- Content creation and education
- **Target**: 10,000 active users in 6 months

### Health Token Economy ($75,000)
- Liquidity provision for ICPSwap
- Staking reward pool
- Partnership incentives
- Referral program funding
- **Target**: $1M+ in total value locked

### Mobile Beta Expansion ($75,000)
- PWA development and optimization
- Mobile-specific features
- Offline functionality
- Push notification system
- **Target**: 50% mobile user adoption

### Success Metrics for Investor Readiness
- **Users**: 10,000 active monthly users
- **Proofs**: 100,000+ verified submissions
- **TVL**: $1M+ in staked tokens
- **Retention**: 95% 30-day retention rate
- **Revenue**: $50K+ monthly from marketplace

## Use of Funds Breakdown

| Category | DFINITY Grant | YC/a16z | Total |
|----------|---------------|---------|-------|
| Development | $35,000 | $50,000 | $85,000 |
| Marketing | $5,000 | $75,000 | $80,000 |
| Operations | $5,000 | $25,000 | $30,000 |
| Liquidity | $5,000 | $50,000 | $55,000 |
| Legal/Compliance | $0 | $25,000 | $25,000 |
| Contingency | $0 | $25,000 | $25,000 |
| **Total** | **$50,000** | **$250,000** | **$300,000** |

Visual references: All funding and financial visualizations`
    },
    {
      id: 'appendix',
      title: 'Appendix: Key Questions',
      icon: FileCheck,
      content: `# Appendix: Key Questions

## How will Proof of Vitality become an open Internet standard for verifiable wellness?

### Open Protocol Specification
1. **Public API**: Open-source SDK for health app integration
2. **Interoperability**: Cross-chain proof verification
3. **Standard Format**: Universal health data exchange format
4. **Developer Ecosystem**: Grant program for third-party builders

### Adoption Strategy
- Partner with major wearable manufacturers
- Integrate with existing health platforms
- Publish research on proof verification methods
- Host developer hackathons and workshops

### Governance Model
- Community-driven protocol evolution
- Token-weighted voting on standards
- Open proposal system for improvements
- Transparent decision-making process

## What measurable impact indicators validate long-term health outcomes?

### Individual Metrics
1. **Vitality Score**: Composite health score (0-100)
2. **Proof Streaks**: Consecutive days of verified health data
3. **Domain Progress**: Improvement across 8 health domains
4. **Biomarker Trends**: Lab results over time

### Population-Level Metrics
1. **Aggregate Health Scores**: Community average vitality
2. **Proof Submission Rate**: Daily active participation
3. **Health Improvement Rate**: % of users showing progress
4. **Longevity Indicators**: Biological age vs chronological age

### Validation Methods
- Longitudinal studies with academic partners
- Peer-reviewed research publications
- Insurance actuarial data analysis
- Clinical trial partnerships

## How does Ascend's model advance decentralized AI ethics and ICP's mission?

### Privacy-First AI Architecture
- **On-Chain Processing**: No external API dependencies
- **Normalized Data**: Only aggregated patterns processed
- **User Consent**: Explicit opt-in for AI features
- **Transparency**: Open-source AI prompts and logic

### Alignment with ICP Mission
1. **Decentralization**: Fully on-chain application
2. **User Sovereignty**: Complete data ownership
3. **Privacy**: HIPAA-grade data protection
4. **Scalability**: Leverages ICP's unlimited capacity

### Ethical AI Principles
- No raw health data exposure
- Explainable AI recommendations
- User control over AI interactions
- Bias detection and mitigation

### Future DeAI Integration
- Decentralized AI model training
- Federated learning on anonymized data
- Community-owned AI models
- Privacy-preserving inference

## Technical References

### ICP SDK Documentation
- Internet Computer Developer Docs: https://internetcomputer.org/docs
- Motoko Programming Language: https://internetcomputer.org/docs/motoko
- Internet Identity: https://internetcomputer.org/internet-identity

### On-Chain AI Canister
- **Canister ID**: w36hm-eqaaa-aaal-qr76a-cai
- **Model**: ICP-native LLM optimized for health insights
- **Performance**: <2s response time, monitored cycles usage
- **Privacy**: HIPAA-compliant processing with normalized data

### Token Economy Documentation
- ICPSwap Integration: https://icpswap.com
- Staking Mechanisms: Motoko smart contracts
- Reward Distribution: Automated on-chain logic

## Next Steps for DFINITY Submission

### Immediate Actions (Week 1)
1. ✅ Complete white paper draft
2. ✅ Prepare technical documentation
3. ✅ Create demo video
4. ✅ Submit grant application

### Follow-Up (Week 2-4)
1. ✅ Technical review with DFINITY team
2. ✅ Address feedback and questions
3. ✅ Finalize milestone deliverables
4. ✅ Begin development on approved milestones

### Success Criteria
- Grant approval within 4 weeks
- First milestone completion within 6 weeks
- Beta launch within 8 weeks
- Full deployment within 12 weeks

Visual references: All technical diagrams and architecture visualizations`
    }
  ];

  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    try {
      const documentId = await createDocument.mutateAsync(newDocumentTitle);
      toast.success('White paper document created successfully!');
      setNewDocumentTitle('');
      setActiveTab('editor');
    } catch (error) {
      toast.error('Failed to create document');
      console.error(error);
    }
  };

  const handleAddSection = async () => {
    if (!selectedDocument) {
      toast.error('Please select a document first');
      return;
    }

    if (!newSection.title.trim() || !newSection.content.trim()) {
      toast.error('Please fill in section title and content');
      return;
    }

    try {
      const section: WhitePaperSection = {
        id: `section-${Date.now()}`,
        title: newSection.title,
        content: newSection.content,
        order: BigInt(newSection.order),
        lastUpdated: BigInt(Date.now())
      };

      await addSection.mutateAsync({
        documentId: selectedDocument.id,
        section
      });

      toast.success('Section added successfully!');
      setNewSection({ title: '', content: '', order: 1 });
    } catch (error) {
      toast.error('Failed to add section');
      console.error(error);
    }
  };

  const handleUpdateSection = async () => {
    if (!selectedDocument || !editingSection) return;

    try {
      await updateSection.mutateAsync({
        documentId: selectedDocument.id,
        sectionId: editingSection.id,
        updatedSection: editingSection
      });

      toast.success('Section updated successfully!');
      setEditingSection(null);
    } catch (error) {
      toast.error('Failed to update section');
      console.error(error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!selectedDocument) return;

    try {
      await deleteSection.mutateAsync({
        documentId: selectedDocument.id,
        sectionId
      });

      toast.success('Section deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete section');
      console.error(error);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedDocument) return;

    try {
      await updateStatus.mutateAsync({
        documentId: selectedDocument.id,
        status
      });

      toast.success(`Document status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument.mutateAsync(documentId);
      toast.success('Document deleted successfully!');
      setSelectedDocument(null);
    } catch (error) {
      toast.error('Failed to delete document');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    if (!selectedDocument) return;
    toast.info('PDF export functionality coming soon!');
  };

  const handleUseTemplate = (template: typeof sectionTemplates[0]) => {
    setNewSection({
      title: template.title,
      content: template.content,
      order: selectedDocument?.sections.length ? selectedDocument.sections.length + 1 : 1
    });
    toast.success(`Template "${template.title}" loaded!`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: Clock },
      review: { variant: 'default' as const, icon: Eye },
      published: { variant: 'default' as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black gradient-text mb-2">White Paper Generator</h1>
              <p className="text-muted-foreground">
                Create comprehensive white papers for funding applications and partnerships
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF} disabled={!selectedDocument}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" disabled={!selectedDocument}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This white paper generator helps you create professional documents for DFINITY grants, investor pitches, and partnership proposals. Use the templates to get started quickly.
            </AlertDescription>
          </Alert>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Edit className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileCheck className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Create New Document</CardTitle>
                <CardDescription>
                  Start a new white paper document from scratch or use a template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter document title (e.g., Ascend Health: Proof of Vitality)"
                    value={newDocumentTitle}
                    onChange={(e) => setNewDocumentTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleCreateDocument} disabled={createDocument.isPending}>
                    {createDocument.isPending ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No documents yet. Create your first white paper above!
                </div>
              ) : (
                documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`modern-card cursor-pointer transition-all ${
                      selectedDocument?.id === doc.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        {getStatusBadge(doc.status)}
                      </div>
                      <CardDescription>
                        Version {Number(doc.version)} • {doc.sections.length} sections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(Number(doc.createdAt) / 1000000).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Updated: {new Date(Number(doc.updatedAt) / 1000000).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                            setActiveTab('editor');
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            {!selectedDocument ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select or create a document first to start editing.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card className="modern-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedDocument.title}</CardTitle>
                        <CardDescription>
                          Version {Number(selectedDocument.version)} • {selectedDocument.sections.length} sections
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus('draft')}
                        >
                          Draft
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus('review')}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus('published')}
                        >
                          Publish
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle>Add New Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="section-title">Section Title</Label>
                        <Input
                          id="section-title"
                          value={newSection.title}
                          onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                          placeholder="e.g., Executive Abstract"
                        />
                      </div>
                      <div>
                        <Label htmlFor="section-order">Order</Label>
                        <Input
                          id="section-order"
                          type="number"
                          value={newSection.order}
                          onChange={(e) => setNewSection({ ...newSection, order: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="section-content">Content (Markdown supported)</Label>
                        <Textarea
                          id="section-content"
                          value={newSection.content}
                          onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                          placeholder="Enter section content..."
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button onClick={handleAddSection} disabled={addSection.isPending} className="w-full">
                        {addSection.isPending ? (
                          <>Adding...</>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Section
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle>Existing Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px]">
                        {selectedDocument.sections.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No sections yet. Add your first section!
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedDocument.sections
                              .sort((a, b) => Number(a.order) - Number(b.order))
                              .map((section) => (
                                <Card key={section.id} className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold">{section.title}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        Order: {Number(section.order)}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingSection(section)}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteSection(section.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-3">
                                    {section.content.substring(0, 150)}...
                                  </p>
                                </Card>
                              ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {editingSection && (
                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle>Edit Section: {editingSection.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editingSection.title}
                          onChange={(e) =>
                            setEditingSection({ ...editingSection, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Content</Label>
                        <Textarea
                          value={editingSection.content}
                          onChange={(e) =>
                            setEditingSection({ ...editingSection, content: e.target.value })
                          }
                          rows={15}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateSection} disabled={updateSection.isPending}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingSection(null)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Section Templates</CardTitle>
                <CardDescription>
                  Pre-built sections for the Ascend Health white paper. Click to use a template.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={template.id}
                    className="modern-card cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                      </div>
                      <CardDescription>
                        {template.content.substring(0, 100)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" className="w-full">
                        <Plus className="w-3 h-3 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {!selectedDocument ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a document to preview.
                </AlertDescription>
              </Alert>
            ) : (
              <Card className="modern-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedDocument.title}</CardTitle>
                      <CardDescription>
                        Preview of your white paper document
                      </CardDescription>
                    </div>
                    {getStatusBadge(selectedDocument.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[800px] w-full rounded-lg border p-8 bg-white dark:bg-gray-900">
                    <div className="max-w-4xl mx-auto space-y-8 prose dark:prose-invert">
                      <div className="text-center space-y-4 border-b pb-8">
                        <h1 className="text-4xl font-black">{selectedDocument.title}</h1>
                        <p className="text-muted-foreground">
                          Version {Number(selectedDocument.version)} • {new Date(Number(selectedDocument.updatedAt) / 1000000).toLocaleDateString()}
                        </p>
                      </div>

                      {selectedDocument.sections.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          No sections added yet. Add sections in the Editor tab.
                        </div>
                      ) : (
                        selectedDocument.sections
                          .sort((a, b) => Number(a.order) - Number(b.order))
                          .map((section, index) => (
                            <div key={section.id} className="space-y-4">
                              <Separator />
                              <div>
                                <h2 className="text-2xl font-bold mb-4">
                                  {Number(section.order)}. {section.title}
                                </h2>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {section.content}
                                </div>
                              </div>
                            </div>
                          ))
                      )}

                      <Separator />
                      <div className="text-center text-sm text-muted-foreground pt-8">
                        <p>© 2025 Ascend Health. Built with love using caffeine.ai.</p>
                        <p className="mt-2">For more information, visit ascendhealth.io</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WhitePaperGenerator;
