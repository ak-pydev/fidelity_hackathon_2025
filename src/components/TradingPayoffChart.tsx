import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trade } from "@/types";

interface TradingPayoffChartProps {
  portfolio: Trade[];
}

export default function TradingPayoffChart({ portfolio }: TradingPayoffChartProps) {
  // Very simplified payoff calculation
  const data = Array.from({ length: 21 }, (_, i) => {
    const price = 100 + i * 5;
    let payoff = 0;

    portfolio.forEach((opt) => {
      if (opt.type === "call") {
        payoff += Math.max(price - opt.strike, 0) - opt.premium;
      } else {
        payoff += Math.max(opt.strike - price, 0) - opt.premium;
      }
    });

    return { price, payoff };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Payoff Diagram</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="price" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="payoff" stroke="#6366F1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}