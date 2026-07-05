import { Link, useLocation } from "wouter";
import { Show, useClerk } from "@clerk/react";
import {
  Droplet,
  Home,
  Users,
  BarChart2,
  PlusCircle,
  User as UserIcon,
  LogOut,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Inicio" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/add", icon: PlusCircle, label: "Añadir", primary: true },
  { href: "/group", icon: Users, label: "Grupo" },
  { href: "/profile", icon: UserIcon, label: "Perfil" },
];

function BottomNav() {
  const [location] = useLocation();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Frosted glass backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      <div className="relative flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom,12px)] pt-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
          const fullHref = `${basePath}${href}`;
          const isActive = location === href || location.startsWith(href + "/");

          if (primary) {
            return (
              <Link key={href} href={href}>
                <button className="flex flex-col items-center gap-0.5 -mt-5 px-3">
                  <span className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                  </span>
                  <span className="text-[10px] font-semibold text-primary mt-1">{label}</span>
                </button>
              </Link>
            );
          }

          return (
            <Link key={href} href={href}>
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[48px]">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="flex items-center gap-2 px-4 h-12">
        <Droplet className="w-5 h-5 text-primary" fill="currentColor" />
        <span className="font-serif font-bold text-lg tracking-tight text-primary">LloroLog</span>
      </div>
    </header>
  );
}

function Sidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const sideItems = [
    { href: "/dashboard", icon: Home, label: "Inicio" },
    { href: "/add", icon: PlusCircle, label: "Nuevo lloro", primary: true },
    { href: "/stats", icon: BarChart2, label: "Mis stats" },
    { href: "/group", icon: Users, label: "El grupo" },
    { href: "/calm", icon: Leaf, label: "Calm Corner" },
    { href: "/profile", icon: UserIcon, label: "Perfil" },
  ];

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r min-h-[100dvh] p-4 flex-col gap-3 bg-card/50">
      <div className="flex items-center gap-2 px-2 pb-4 border-b">
        <Droplet className="w-6 h-6 text-primary" fill="currentColor" />
        <span className="font-serif font-bold text-xl tracking-tight text-primary">LloroLog</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {sideItems.map(({ href, icon: Icon, label, primary }) => {
          const isActive = location === href || location.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <span
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  primary
                    ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                    : isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground/80"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="pt-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" /> Salir
        </Button>
      </div>
    </aside>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      <Show when="signed-in">
        <MobileHeader />
        <Sidebar />
        <BottomNav />
      </Show>

      {/* Main content — extra bottom padding on mobile to clear the bottom nav */}
      <main className="flex-1 px-4 pt-4 pb-28 md:pb-8 md:px-8 md:pt-8 max-w-4xl mx-auto w-full min-h-[100dvh]">
        {children}
      </main>
    </div>
  );
}
