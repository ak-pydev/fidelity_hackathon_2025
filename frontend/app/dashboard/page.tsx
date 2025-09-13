'use client';

import React, { useState } from "react";
import { Layout } from "../../components/Layout";
import TradeForm from "@/components/TradeForm";
import PortfolioTable from "@/components/portfolioTable";
import PayoffChart from "@/components/PayOffChart";
import { mockPortfolio } from "@/utils/mockData";

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(mockPortfolio);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your portfolio and track your options trading performance
            </p>
          </div>

          {/* Trade Form Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add New Trade
              </h2>
              <TradeForm portfolio={portfolio} setPortfolio={setPortfolio} />
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Positions
              </h2>
              <PortfolioTable portfolio={portfolio} />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Portfolio Performance
              </h2>
              <PayoffChart portfolio={portfolio} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
