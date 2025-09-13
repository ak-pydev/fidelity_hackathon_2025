import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatPercentage } from "@/utils/formatting";

interface InsightCardProps {
  insight: string;
  probabilityOfProfit: number;
}

export function InsightCard({ insight, probabilityOfProfit }: InsightCardProps) {
  return (
    <Card className="p-6 card-gradient">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Insight</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">{insight}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Probability of Profit</span>
            <span className="font-medium">{formatPercentage(probabilityOfProfit)}%</span>
          </div>
          <Progress value={probabilityOfProfit * 100} className="h-2" />
        </div>
      </div>
    </Card>
  );
}