import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface PayoffChartProps {
  data: Array<{ price: number; pl: number }>;
  breakeven?: number;
}

export function PayoffChart({ data, breakeven }: PayoffChartProps) {
  return (
    <Card className="p-6 card-gradient">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Payoff Curve</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
          {breakeven && (
            <ReferenceLine 
              x={breakeven} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="4 4"
              label="Breakeven"
            />
          )}
          <Line 
            type="monotone" 
            dataKey="pl" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}