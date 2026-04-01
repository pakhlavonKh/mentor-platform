import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
}

export function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <Card className="shadow-card border border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold text-card-foreground">{value}</p>
            {trend && <p className="text-xs text-primary font-medium">{trend}</p>}
          </div>
          <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
