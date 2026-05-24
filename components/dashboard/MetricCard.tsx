import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  trendLabel?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendLabel,
  status = 'info',
  icon: Icon,
  className
}: MetricCardProps) {
  
  const statusColors = {
    success: 'text-supply',
    warning: 'text-amber-500',
    error: 'text-unavailable',
    info: 'text-primary'
  };

  const TrendIcon = trend && trend > 0 ? ArrowUpRight : trend && trend < 0 ? ArrowDownRight : Minus;

  return (
    <Card className={cn("bg-card border-border/70 overflow-hidden relative shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-data text-muted-foreground uppercase tracking-widest">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight font-data">{value}</h3>
              {trend !== undefined && (
                <div className={cn(
                  "flex items-center text-[10px] font-semibold font-data",
                  trend > 0 ? "text-unavailable" : "text-supply"
                )}>
                  <TrendIcon className="size-3 mr-0.5" />
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg bg-muted/50", statusColors[status])}>
              <Icon className="size-5" />
            </div>
          )}
        </div>

        {trendLabel && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[10px] font-data text-muted-foreground uppercase tracking-tighter">
              {trendLabel}
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Subtle accent line */}
      <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-50", 
        status === 'success' ? 'bg-supply' :
        status === 'warning' ? 'bg-amber-500' :
        status === 'error' ? 'bg-unavailable' :
        'bg-primary'
      )} />
    </Card>
  );
}
