import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { formatGreek } from "@/utils/formatting";

interface GreeksCardProps {
  greeks: {
    delta: number;
    theta: number;
  };
}

export function GreeksCard({ greeks }: GreeksCardProps) {
  const getDeltaBadgeColor = (delta: number) => {
    if (delta > 0.5) return "bg-success/20 text-success";
    if (delta > 0) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const getThetaBadgeColor = (theta: number) => {
    if (theta < -0.15) return "bg-destructive/20 text-destructive";
    if (theta < -0.05) return "bg-warning/20 text-warning";
    return "bg-success/20 text-success";
  };

  return (
    <Card className="p-6 card-gradient">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Greeks</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div>
            <p className="font-medium">Delta</p>
            <p className="text-sm text-muted-foreground">Price sensitivity</p>
          </div>
          <Badge className={getDeltaBadgeColor(greeks.delta)}>
            {greeks.delta > 0 ? '+' : ''}{formatGreek(greeks.delta)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div>
            <p className="font-medium">Theta</p>
            <p className="text-sm text-muted-foreground">Time decay per day</p>
          </div>
          <Badge className={getThetaBadgeColor(greeks.theta)}>
            {greeks.theta > 0 ? '+' : ''}${Math.abs(greeks.theta).toFixed(2)}
          </Badge>
        </div>
      </div>
    </Card>
  );
}