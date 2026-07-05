import { useListCries, useGetStatsOverview, useGetMe } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlusCircle, Droplet, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const INTENSITY_EMOJI: Record<number, string> = {
  1: "🥲", 2: "🥲", 3: "😢", 4: "😢", 5: "😭",
  6: "😭", 7: "🌧️", 8: "🌧️", 9: "🌊", 10: "🌊",
};

export function DashboardPage() {
  const { data: user } = useGetMe();
  const { data: cries, isLoading: isLoadingCries } = useListCries({ userId: user?.id.toString(), limit: 5 });
  const { data: stats, isLoading: isLoadingStats } = useGetStatsOverview({ userId: user?.id.toString() });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary leading-tight">
            Hola, {user?.name.split(" ")[0] ?? "…"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">Bienvenido a tu espacio seguro.</p>
        </div>
        <Link href="/add">
          <Button size="sm" className="rounded-xl shadow-sm bg-primary hover:opacity-90 shrink-0">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Añadir</span>
            <span className="sm:hidden">+</span>
          </Button>
        </Link>
      </div>

      {/* Stat cards — 3 columns on mobile */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl border-border/50 shadow-sm bg-secondary/30">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Mes
            </p>
            {isLoadingStats
              ? <Skeleton className="h-7 w-10" />
              : <p className="text-2xl font-bold text-secondary-foreground">{stats?.thisMonth ?? 0}</p>}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-accent/30">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Droplet className="w-3 h-3" /> Media
            </p>
            {isLoadingStats
              ? <Skeleton className="h-7 w-10" />
              : <p className="text-2xl font-bold text-accent-foreground">{stats?.avgIntensity?.toFixed(1) ?? "0.0"}</p>}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-primary/10">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Tipo
            </p>
            {isLoadingStats
              ? <Skeleton className="h-7 w-14" />
              : <p className="text-xs font-bold text-primary leading-tight line-clamp-2">{stats?.topCryType ?? "N/A"}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Quick action — big tap-friendly button */}
      <Link href="/add">
        <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-5 flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💧</span>
            <div>
              <p className="font-bold text-primary">Registrar un lloro</p>
              <p className="text-xs text-muted-foreground">Tómate tu tiempo, aquí estamos.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-primary/50" />
        </div>
      </Link>

      {/* Recent cries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold">Últimos registros</h2>
          <Link href="/stats" className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
            Ver todo <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoadingCries ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : cries?.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-2xl border border-dashed">
            <Droplet className="w-7 h-7 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aún no tienes registros.</p>
            <p className="text-xs text-muted-foreground/70">Cuando lo necesites, aquí estamos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cries?.map(cry => (
              <div
                key={cry.id}
                className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex items-center gap-3"
              >
                <span className="text-2xl shrink-0">{INTENSITY_EMOJI[cry.intensity] ?? "😭"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm">{cry.intensity}/10</span>
                    {cry.cryType && (
                      <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-medium truncate">
                        {cry.cryType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {format(new Date(cry.occurredAt), "d MMM, p", { locale: es })}
                    {cry.reason ? ` · ${cry.reason}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
