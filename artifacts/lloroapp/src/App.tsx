import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Layout } from "./components/layout";

// Pages (to be created)
import { HomePage } from "./pages/home";
import { DashboardPage } from "./pages/dashboard";
import { AddCryPage } from "./pages/add-cry";
import { CalmPage } from "./pages/calm";
import { StatsPage } from "./pages/stats";
import { WrappedPage } from "./pages/wrapped";
import { GroupPage } from "./pages/group";
import { UserProfilePage } from "./pages/user-profile";
import { ProfilePage } from "./pages/profile";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(270 50% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorForeground: "hsl(330 10% 20%)",
    colorMutedForeground: "hsl(330 10% 45%)",
    colorDanger: "hsl(0 60% 60%)",
    colorInput: "hsl(330 20% 90%)",
    colorInputForeground: "hsl(330 10% 20%)",
    colorNeutral: "hsl(330 20% 90%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white dark:bg-zinc-900 rounded-3xl w-[440px] max-w-full overflow-hidden shadow-xl shadow-primary/5",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-serif text-primary",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-green-600",
    alertText: "text-danger",
    logoBox: "h-12 w-auto mx-auto mb-4",
    logoImage: "h-full w-auto",
    socialButtonsBlockButton: "border-neutral hover:bg-neutral/50 transition-colors",
    formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
    formFieldInput: "border-neutral bg-input text-inputForeground rounded-xl focus:ring-primary",
    footerAction: "justify-center",
    dividerLine: "bg-neutral",
    alert: "bg-danger/10 border-danger text-danger",
    otpCodeFieldInput: "border-neutral focus:border-primary focus:ring-primary",
    formFieldRow: "gap-4",
    main: "gap-6",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <HomePage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bienvenido a LloroLog",
            subtitle: "Entra a tu espacio seguro",
          },
        },
        signUp: {
          start: {
            title: "Únete a LloroLog",
            subtitle: "Un lugar para sentir sin juzgar",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Layout>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
            <Route path="/add" component={() => <ProtectedRoute component={AddCryPage} />} />
            <Route path="/calm" component={CalmPage} />
            <Route path="/stats" component={StatsPage} />
            <Route path="/wrapped" component={WrappedPage} />
            <Route path="/group" component={GroupPage} />
            <Route path="/users/:userId" component={UserProfilePage} />
            <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
            <Route>
              <div className="text-center py-20">
                <h1 className="text-4xl font-serif text-primary">404</h1>
                <p className="text-muted-foreground mt-4">Página no encontrada.</p>
              </div>
            </Route>
          </Switch>
        </Layout>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;