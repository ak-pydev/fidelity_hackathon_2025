const mockLeaderboard = [
  { name: "Alice", portfolio: 120000 },
  { name: "Bob", portfolio: 115000 },
  { name: "Charlie", portfolio: 98000 },
];

export default function Leaderboard() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2">Rank</th>
            <th className="p-2">Player</th>
            <th className="p-2">Portfolio Value</th>
          </tr>
        </thead>
        <tbody>
          {mockLeaderboard.map((player, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-2">{i + 1}</td>
              <td className="p-2 font-medium">{player.name}</td>
              <td className="p-2">${player.portfolio.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
