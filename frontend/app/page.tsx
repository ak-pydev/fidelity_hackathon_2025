import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
      <h1 className="text-5xl font-bold mb-6">Fantasy Options League</h1>
      <p className="text-lg mb-8 text-center max-w-2xl">
        Compete with friends by trading simulated options. Learn hedging, risk,
        and strategies—all while having fun like fantasy sports.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard" className="bg-white text-indigo-600 px-6 py-3 rounded-2xl shadow hover:scale-105 transition">
          Go to Dashboard
        </Link>
        <Link href="/leagues" className="bg-yellow-400 text-black px-6 py-3 rounded-2xl shadow hover:scale-105 transition">
          View League
        </Link>
      </div>
    </main>
  );
}
