import { useGetTrends, useGetMe } from "@workspace/api-client-react";
import { Heatmap } from "@/components/heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

export function StatsPage() {
  const { data: user } = useGetMe();
  const { data: trends, isLoading } = useGetTrends({ userId: user?.id.toString() });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Tus Estadísticas</h1>
        <p className="text-muted-foreground">Un vistazo a tu mundo emocional.</p>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif">El mapa de tus lágrimas</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap userId={user?.id.toString()} />
        </CardContent>
      </Card>

      {trends?.peakInsight && (
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 text-center">
          <p className="text-lg font-serif italic text-primary">"{trends.peakInsight}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Por tipo de emoción</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? <Skeleton className="w-full h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends?.byType || []} layout="vertical" margin={{ left: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="cryType" type="category" axisLine={false} tickLine={false} fontSize={12} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {(trends?.byType || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(270 50% ${maxMath(40, 80 - index * 10)}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Acompañamiento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            {isLoading ? <Skeleton className="w-40 h-40 rounded-full" /> : (
              <div className="flex w-full gap-4 h-full items-end pb-4 px-8">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-secondary rounded-t-xl transition-all"
                    style={{ 
                      height: `${Math.max(10, (trends?.aloneVsCompany.alone || 0) / (Math.max(1, (trends?.aloneVsCompany.alone || 0) + (trends?.aloneVsCompany.withOthers || 0))) * 100)}%` 
                    }}
                  />
                  <span className="text-sm font-medium">A solas ({trends?.aloneVsCompany.alone})</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-accent rounded-t-xl transition-all"
                    style={{ 
                      height: `${Math.max(10, (trends?.aloneVsCompany.withOthers || 0) / (Math.max(1, (trends?.aloneVsCompany.alone || 0) + (trends?.aloneVsCompany.withOthers || 0))) * 100)}%` 
                    }}
                  />
                  <span className="text-sm font-medium">Acompañado ({trends?.aloneVsCompany.withOthers})</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function maxMath(min: number, val: number) {
  return Math.max(min, val);
}