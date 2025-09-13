import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { formatPercentage } from "@/utils/formatting";

interface MonteCarloChartProps {
  payoffCurve: Array<{ price: number; pl: number }>;
  bands?: {
    p50: Array<{ price: number; pl: number }>;
    p80: Array<{ price: number; pl: number }>;
  };
  probabilityOfProfit: number;
}

export function MonteCarloChart({ payoffCurve, bands, probabilityOfProfit }: MonteCarloChartProps) {
  // Create proper Monte Carlo visualization with realistic bands
  const chartData = payoffCurve.map((point, index) => {
    const p50Point = bands?.p50[index];
    const p80Point = bands?.p80[index];
    
    return {
      price: point.price,
      payoff: point.pl,
      p50Lower: p50Point ? Math.min(p50Point.pl, point.pl) : point.pl - Math.abs(point.pl) * 0.1,
      p50Upper: p50Point ? Math.max(p50Point.pl, point.pl) : point.pl + Math.abs(point.pl) * 0.1,
      p80Lower: p80Point ? Math.min(p80Point.pl, point.pl) : point.pl - Math.abs(point.pl) * 0.2,
      p80Upper: p80Point ? Math.max(p80Point.pl, point.pl) : point.pl + Math.abs(point.pl) * 0.2,
    };
  });

  return (
    <Card className="p-6 card-gradient">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Monte Carlo Simulation</h3>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Profit Probability: </span>
          <span className="font-semibold text-primary">
            {formatPercentage(probabilityOfProfit)}%
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="price" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Area
            type="monotone"
            dataKey="p80Upper"
            stackId="1"
            stroke="transparent"
            fill="hsl(var(--chart-2) / 0.1)"
          />
          <Area
            type="monotone"
            dataKey="p80Lower"
            stackId="1"
            stroke="transparent"
            fill="hsl(var(--background))"
          />
          <Area
            type="monotone"
            dataKey="p50Upper"
            stackId="2"
            stroke="transparent"
            fill="hsl(var(--primary) / 0.15)"
          />
          <Area
            type="monotone"
            dataKey="p50Lower"
            stackId="2"
            stroke="transparent"
            fill="hsl(var(--background))"
          />
          <Area
            type="monotone"
            dataKey="payoff"
            stackId="3"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}