import { useState } from "react";
import { Trade } from "@/types";

interface TradeFormProps {
  portfolio: Trade[];
  setPortfolio: (p: Trade[]) => void;
}

export default function TradeForm({ portfolio, setPortfolio }: TradeFormProps) {
  const [stock, setStock] = useState("AAPL");
  const [type, setType] = useState<'call' | 'put'>("call");
  const [strike, setStrike] = useState(150);
  const [premium, setPremium] = useState(5);

  const handleTrade = () => {
    const newTrade: Trade = { stock, type, strike, premium, quantity: 1 };
    setPortfolio([...portfolio, newTrade]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Make a Trade</h2>
      <div className="flex gap-4 mb-4">
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border p-2 rounded w-24"
          placeholder="Ticker"
        />
        <select value={type} onChange={(e) => setType(e.target.value as 'call' | 'put')} className="border p-2 rounded">
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
        <input
          type="number"
          value={strike}
          onChange={(e) => setStrike(Number(e.target.value))}
          className="border p-2 rounded w-24"
          placeholder="Strike"
        />
        <input
          type="number"
          value={premium}
          onChange={(e) => setPremium(Number(e.target.value))}
          className="border p-2 rounded w-24"
          placeholder="Premium"
        />
        <button
          onClick={handleTrade}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          Buy
        </button>
      </div>
    </div>
  );
}