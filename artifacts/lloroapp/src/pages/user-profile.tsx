import { useRoute } from "wouter";
import { useGetUserProfile, useGetStatsOverview } from "@workspace/api-client-react";
import { Heatmap } from "@/components/heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserProfilePage() {
  const [, params] = useRoute("/users/:userId");
  const userId = params?.userId;
  
  const { data: user, isLoading: isLoadingUser } = useGetUserProfile(userId || "");
  const { data: stats } = useGetStatsOverview({ userId });

  if (isLoadingUser) {
    return <div className="animate-pulse space-y-8 p-4"><div className="h-20 bg-muted rounded-xl"></div></div>;
  }

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-md">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{user.name}</h1>
          <p className="text-muted-foreground">Miembro desde {new Date(user.createdAt).getFullYear()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-2xl border shadow-sm text-center">
          <p className="text-sm text-muted-foreground mb-1">Total lloros</p>
          <p className="text-2xl font-bold text-primary">{stats?.totalCries || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border shadow-sm text-center">
          <p className="text-sm text-muted-foreground mb-1">Este mes</p>
          <p className="text-2xl font-bold text-secondary-foreground">{stats?.thisMonth || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border shadow-sm text-center col-span-2">
          <p className="text-sm text-muted-foreground mb-1">Emoción frecuente</p>
          <p className="text-xl font-bold text-accent-foreground">{stats?.topCryType || "N/A"}</p>
        </div>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif text-lg">El año de {user.name.split(" ")[0]}</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}