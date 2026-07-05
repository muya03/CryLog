import { useGetHeatmap, useGetMe } from "@workspace/api-client-react";
import { format, subDays, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface HeatmapProps {
  userId?: string;
  year?: number;
}

export function Heatmap({ userId, year }: HeatmapProps) {
  const { data: heatmapData, isLoading } = useGetHeatmap({ userId, year });

  if (isLoading) {
    return <div className="h-40 w-full bg-muted/20 animate-pulse rounded-2xl"></div>;
  }

  // Generate 52 weeks of days ending today
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 1 }); // Start on Monday 52 weeks ago
  
  const days: Date[] = [];
  let currentDate = startDate;
  
  for (let i = 0; i < 364; i++) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  const getDayData = (date: Date) => {
    if (!heatmapData) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    return heatmapData.find(d => d.date.startsWith(dateStr));
  };

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-muted/30 dark:bg-muted/10";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    if (count === 3) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] flex gap-1">
        {/* Render columns (weeks) */}
        {Array.from({ length: 52 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const day = days[weekIndex * 7 + dayIndex];
              if (!day) return <div key={dayIndex} className="w-3 h-3" />; // Spacer
              
              const data = getDayData(day);
              const count = data?.count || 0;
              
              return (
                <div 
                  key={dayIndex} 
                  className={`w-3 h-3 rounded-sm ${getColorClass(count)} cursor-help transition-colors hover:ring-2 ring-primary/50`}
                  title={`${format(day, "d MMM yyyy", { locale: es })}: ${count} lloros`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="w-3 h-3 rounded-sm bg-muted/30 dark:bg-muted/10" />
        <div className="w-3 h-3 rounded-sm bg-primary/30" />
        <div className="w-3 h-3 rounded-sm bg-primary/50" />
        <div className="w-3 h-3 rounded-sm bg-primary/70" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>Más</span>
      </div>
    </div>
  );
}