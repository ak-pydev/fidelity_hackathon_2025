import { Trade } from "@/types";

interface PortfolioTableProps {
  portfolio: Trade[];
}

export default function PortfolioTable({ portfolio }: PortfolioTableProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Open Positions</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2">Stock</th>
            <th className="p-2">Type</th>
            <th className="p-2">Strike</th>
            <th className="p-2">Premium</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Cost</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4 text-gray-500">
                No open trades yet. Use the form above to make one!
              </td>
            </tr>
          ) : (
            portfolio.map((trade, i) => {
              const cost = trade.premium * trade.quantity * 100; // contracts usually = 100 shares
              return (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{trade.stock}</td>
                  <td className="p-2 capitalize">{trade.type}</td>
                  <td className="p-2">${trade.strike}</td>
                  <td className="p-2">${trade.premium}</td>
                  <td className="p-2">{trade.quantity}</td>
                  <td className="p-2">${cost.toLocaleString()}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
