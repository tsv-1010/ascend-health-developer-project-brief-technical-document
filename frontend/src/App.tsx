import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import LoadingScreen from './components/LoadingScreen';
import SplashScreen from './pages/SplashScreen';
import OnboardingFlow from './pages/OnboardingFlow';
import MainDashboard from './pages/MainDashboard';
import DomainDashboard from './pages/DomainDashboard';
import Settings from './pages/Settings';
import Rewards from './pages/Rewards';
import DefiDashboard from './pages/DefiDashboard';
import HealthShop from './pages/HealthShop';
import AdminDashboard from './pages/AdminDashboard';
import WhitePaperGenerator from './pages/WhitePaperGenerator';
import SprintDashboard from './pages/SprintDashboard';
import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';

// Create root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Create routes
const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SplashScreen,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingFlow,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: MainDashboard,
});

const domainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/domain/$domainId',
  component: DomainDashboard,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const rewardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rewards',
  component: Rewards,
});

const defiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/defi',
  component: DefiDashboard,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: HealthShop,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const whitePaperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/whitepaper',
  component: WhitePaperGenerator,
});

const sprintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sprint',
  component: SprintDashboard,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  splashRoute,
  onboardingRoute,
  dashboardRoute,
  domainRoute,
  settingsRoute,
  rewardsRoute,
  defiRoute,
  shopRoute,
  adminRoute,
  whitePaperRoute,
  sprintRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    isAuthenticated: false,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity, isInitializing: authInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;

  // Show loading screen while auth is initializing
  if (authInitializing) {
    return <LoadingScreen />;
  }

  // Show loading screen while actor is being created (only after auth completes)
  if (actorFetching) {
    return <LoadingScreen />;
  }

  // Don't render router until we have an actor instance
  if (!actor) {
    return <LoadingScreen />;
  }

  return (
    <RouterProvider
      router={router}
      context={{
        isAuthenticated,
      }}
    />
  );
}

