import { useListUsers, useListCries } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Heatmap } from "@/components/heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function GroupPage() {
  const { data: users, isLoading: isLoadingUsers } = useListUsers();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">El Grupo</h1>
        <p className="text-muted-foreground">Porque las penas se pasan mejor acompañados.</p>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif">Mapa grupal</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold">Miembros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoadingUsers ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          ) : (
            users?.map(user => (
              <Link key={user.id} href={`/users/${user.id}`}>
                <div className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold group-hover:text-primary transition-colors">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">Ver perfil emocional</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      
      <div className="pt-8 flex justify-center">
        <Link href="/wrapped">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer">
            ✨ Ver Resumen Anual Grupal ✨
          </div>
        </Link>
      </div>
    </div>
  );
}