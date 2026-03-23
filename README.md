# Ascend Health - AI-Powered Wellness Platform

A comprehensive wellness platform built on the Internet Computer, featuring AI-powered health guidance, privacy-first data handling, and personalized wellness tracking across 8 key health domains.

## 🚀 Quick Start

### Prerequisites
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager

### Local Development Setup

1. **Start the Internet Computer replica**
   ```bash
   dfx start --clean
   ```

2. **Deploy the backend canister**
   ```bash
   dfx deploy
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## 🏗️ Architecture

### Backend (Motoko)
- **Location**: `backend/src/main.mo`
- **Features**: 
  - User profile management
  - Health domain progress tracking
  - Badge and reward system
  - AI agent interactions
  - Privacy-first data storage
  - Role-based access control

### Frontend (React + TypeScript)
- **Location**: `frontend/src/`
- **Tech Stack**: 
  - React 19 with TypeScript
  - TanStack Router for navigation
  - TanStack Query for state management
  - Tailwind CSS with shadcn/ui components
  - Internet Identity for authentication

## 🎯 Key Features

### ✅ Implemented
- **Authentication**: Internet Identity integration
- **Onboarding**: Multi-step user profile setup with voice input
- **Dashboard**: 8 health domain spheres with progress tracking
- **AI Agent**: Conversational wellness companion with TTS/STT
- **Privacy**: Encrypted data storage on Internet Computer
- **Responsive Design**: Mobile-friendly interface
- **Voice Features**: Browser-based speech recognition and synthesis

### 🔄 In Development
- **Advanced Analytics**: Detailed health insights and trends
- **Community Features**: User interactions and leaderboards
- **Rewards System**: Token-based incentives
- **Mobile App**: React Native implementation

### 🔮 Future Integrations
- **Chain Fusion SDK**: Cross-chain functionality (commented integration points)
- **ZKP Modules**: Zero-knowledge privacy features (privacy infrastructure ready)
- **Threshold Encryption**: Enhanced data security (backend architecture supports)
- **Embedded LLMs**: Advanced AI capabilities (Llama 3/MoAI integration points marked)
- **OAuth Providers**: Google, Apple, Facebook login options
- **Device Sync**: Cross-device data synchronization
- **Wearable Integration**: Fitness tracker and smartwatch connectivity

## 🏥 Health Domains

1. **Fitness** - Exercise tracking and workout recommendations
2. **Nutrition** - Meal planning and dietary guidance
3. **Mental Health** - Stress management and mindfulness
4. **Finances** - Financial wellness and budgeting
5. **Community** - Social connections and support
6. **Environment** - Sustainable living practices
7. **Purpose** - Goal setting and life direction
8. **Longevity** - Long-term health optimization

## 🔒 Privacy & Security

- **Data Encryption**: All user data encrypted at rest
- **Internet Computer**: Decentralized storage with no third-party access
- **Privacy-First**: No external tracking or data mining
- **User Control**: Complete data ownership and control
- **Future ZKP**: Zero-knowledge proofs for enhanced privacy (integration ready)

## 🛠️ Development

### Project Structure
