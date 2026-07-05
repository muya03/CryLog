import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Droplet, Heart, Shield } from "lucide-react";
import { useGetStatsOverview } from "@workspace/api-client-react";

export function HomePage() {
  const { data: stats } = useGetStatsOverview();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center px-6 py-10 max-w-lg mx-auto">
      {/* Logo + título */}
      <div className="mb-8 space-y-5">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary shadow-sm">
          <Droplet className="w-10 h-10" fill="currentColor" />
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary leading-tight tracking-tight">
          Un espacio seguro<br />para tus lágrimas
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          LloroLog es un diario íntimo para ti y tus amigos. Registra tus emociones, descubre patrones y encuentra apoyo.
        </p>
      </div>

      {/* CTAs — apilados en móvil, anchos completos para fácil tap */}
      <div className="flex flex-col gap-3 w-full max-w-xs mb-10">
        <Link href="/sign-up" className="w-full">
          <Button
            size="lg"
            className="w-full h-14 text-base rounded-2xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Crear cuenta
          </Button>
        </Link>
        <Link href="/sign-in" className="w-full">
          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-base rounded-2xl bg-background font-semibold"
          >
            Ya tengo cuenta
          </Button>
        </Link>
      </div>

      {/* Feature cards */}
      <div className="flex flex-col gap-4 w-full text-left">
        <div className="bg-card p-5 rounded-3xl shadow-sm border border-border/50 flex items-start gap-4">
          <div className="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center shrink-0 text-secondary-foreground">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold mb-1">Completamente natural</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Llorar es sano. Visualiza tus tendencias y entiende qué detona tus emociones.</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-3xl shadow-sm border border-border/50 flex items-start gap-4">
          <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center shrink-0 text-accent-foreground">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold mb-1">Entre amigos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Un grupo de confianza donde nadie juzga. Pide ayuda cuando la intensidad es alta.</p>
          </div>
        </div>
      </div>

      {stats && stats.totalCries > 0 && (
        <p className="text-xs text-muted-foreground mt-8">
          Ya hemos compartido {stats.totalCries} lloros juntos.
        </p>
      )}
    </div>
  );
}
