import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trade } from "@/types";

interface TradingPayoffChartProps {
  portfolio: Trade[];
}

export default function TradingPayoffChart({ portfolio }: TradingPayoffChartProps) {
  // Group positions by underlying symbol since payoff axes differ per asset
  const byStock = portfolio.reduce<Record<string, Trade[]>>((acc, t) => {
    acc[t.stock] = acc[t.stock] || [];
    acc[t.stock].push(t);
    return acc;
  }, {});

  const charts = Object.entries(byStock).map(([stock, trades]) => {
    // Determine a reasonable price range based on strikes
    const strikes = trades.map(t => t.strike);
    const minStrike = Math.min(...strikes);
    const maxStrike = Math.max(...strikes);
    const start = Math.max(0, Math.floor(minStrike * 0.6));
    const end = Math.ceil(maxStrike * 1.4);
    const steps = 40;
    const contractMultiplier = 100;

    const data = Array.from({ length: steps + 1 }, (_, i) => {
      const price = start + (end - start) * (i / steps);
      // Dollar payoff across all positions for this underlying
      const payoff = trades.reduce((sum, opt) => {
        const intrinsic = opt.type === 'call'
          ? Math.max(price - opt.strike, 0)
          : Math.max(opt.strike - price, 0);
        // premium is per-share; convert to dollar P/L per contract: (intrinsic - premium) * 100
        const perContract = (intrinsic - opt.premium) * contractMultiplier;
        return sum + perContract * opt.quantity;
      }, 0);
      return { price: Math.round(price * 100) / 100, payoff: Math.round(payoff) };
    });

    return (
      <div key={stock} className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Payoff Diagram — {stock}</h2>
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
  });

  return (
    <div className="space-y-6">
      {charts.length > 0 ? charts : (
        <div className="bg-white p-6 rounded-xl shadow text-gray-500">No positions to display.</div>
      )}
    </div>
  );
}