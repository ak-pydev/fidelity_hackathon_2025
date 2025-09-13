import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PayoffChart } from "@/components/PayoffChart";
import { MonteCarloChart } from "@/components/MonteCarloChart";
import { GreeksCard } from "@/components/GreeksCard";
import { InsightCard } from "@/components/InsightCard";
import { AlertBar } from "@/components/AlertBar";
import { apiService, type AnalysisResult, type AnalysisRequest } from "@/utils/api-service";
import { userService } from "@/utils/user-service";
import { leaderboardService } from "@/utils/leaderboard-service";
import { formatPremium } from "@/utils/formatting";
import { toast } from "sonner";

export function Analysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGamification, setShowGamification] = useState(false);
  const analysisRunning = useRef(false);

  // Paper trading state
  const [paperBalance, setPaperBalance] = useState<number>(100000);
  const [quantity, setQuantity] = useState<number>(1);
  const [heldQty, setHeldQty] = useState<number>(0);
  const [avgCost, setAvgCost] = useState<number>(0);
  const [realizedPnL, setRealizedPnL] = useState<number>(0);
  const [lastTrade, setLastTrade] = useState<
    | null
    | {
        side: 'BUY' | 'SELL';
        qty: number;
        pricePerContract: number; // execution price per contract (premium * 100)
        fees: number;
        total: number; // total cash out/in including fees
        pnl?: number; // total PnL for this trade (SELL only)
        avgCostAtTrade?: number; // avg cost per contract at time of SELL
        perContractPnL?: number; // (sell - avgCostAtTrade)
      }
  >(null);

  // What-if Sell simulation
  const [whatIfPrice, setWhatIfPrice] = useState<number | null>(null);
  useEffect(() => {
    // Initialize what-if price to a reasonable default when analysis loads
    if (analysis && analysis.payoff_curve?.length) {
      const midIndex = Math.floor(analysis.payoff_curve.length / 2);
      setWhatIfPrice(analysis.payoff_curve[midIndex].price);
    }
  }, [analysis?.payoff_curve?.length]);

  const findNearestPlPerShare = (price: number | null): number => {
    if (!analysis || !analysis.payoff_curve || price == null) return 0;
    // Find nearest point on payoff curve by absolute distance to price
    let nearest = analysis.payoff_curve[0];
    let minDiff = Math.abs(nearest.price - price);
    for (const p of analysis.payoff_curve) {
      const diff = Math.abs(p.price - price);
      if (diff < minDiff) {
        nearest = p;
        minDiff = diff;
      }
    }
    // p.pl is per-share P/L relative to entry premium at expiry in mock
    return nearest.pl;
  };

  // (moved below tradePricePerContract)

  // Memoize the contract object to prevent unnecessary re-renders
  const contract = useMemo(() => {
    const contractParam = searchParams.get('contract');
    if (!contractParam) return null;
    try {
      return JSON.parse(decodeURIComponent(contractParam));
    } catch (error) {
      console.error('Failed to parse contract parameter:', error);
      return null;
    }
  }, [searchParams]);

  // Create a stable contract key to prevent duplicate analysis calls
  const contractKey = contract ? `${contract.underlying}-${contract.strike}-${contract.option_type}-${contract.expiration}` : null;

  useEffect(() => {
    if (contract && contractKey && !analysisRunning.current) {
      analyzeContract();
      checkFirstAnalysis();
    }
  }, [contractKey]); // Use contractKey instead of contract object

  // Load paper trading wallet and position for this contract
  useEffect(() => {
    try {
      const bal = localStorage.getItem('paperBalance');
      setPaperBalance(bal ? Number(bal) : 100000);

      if (contractKey) {
        const raw = localStorage.getItem('paperPositions');
        // Support migration from old format (number) to object
        const positions: Record<string, any> = raw ? JSON.parse(raw) : {};
        const pos = positions[contractKey];
        if (typeof pos === 'number') {
          setHeldQty(pos || 0);
          setAvgCost(0);
          setRealizedPnL(0);
        } else if (pos) {
          setHeldQty(pos.quantity || 0);
          setAvgCost(pos.avgCost || 0);
          setRealizedPnL(pos.realizedPnL || 0);
        } else {
          setHeldQty(0);
          setAvgCost(0);
          setRealizedPnL(0);
        }
      }
    } catch (e) {
      console.warn('Failed to load paper trading state', e);
    }
  }, [contractKey]);

  type Position = { quantity: number; avgCost: number; realizedPnL: number };
  const savePaperState = (balance: number, positions: Record<string, Position>) => {
    localStorage.setItem('paperBalance', String(balance));
    localStorage.setItem('paperPositions', JSON.stringify(positions));
  };

  const getPositions = (): Record<string, Position> => {
    try {
      const raw = localStorage.getItem('paperPositions');
      const parsed = raw ? JSON.parse(raw) : {};
      // Normalize old numeric format to object format
      Object.keys(parsed).forEach(k => {
        if (typeof parsed[k] === 'number') {
          parsed[k] = { quantity: parsed[k], avgCost: 0, realizedPnL: 0 };
        }
      });
      return parsed;
    } catch {
      return {};
    }
  };

  const contractMultiplier = 100; // equity option multiplier
  const feePerContract = 1.0; // simple flat fee per contract, per side
  const tradePricePerContract = contract ? contract.premium * contractMultiplier : 0;

  // Sync leaderboard stats with current paper account values for the current league
  useEffect(() => {
    try {
      const user = userService.getCurrentUser();
      const leagueRaw = localStorage.getItem('currentLeague');
      if (!user || !leagueRaw) return;
      const league = JSON.parse(leagueRaw);
      const positionValue = heldQty * tradePricePerContract;
      const portfolioValue = paperBalance + positionValue;
      const totalPnL = portfolioValue - 100000;
      const pnlPercent = (totalPnL / 100000) * 100;
      leaderboardService.updatePlayerStats(league.id, user.id, {
        portfolioValue,
        pnl: totalPnL,
        pnlPercent: Math.round(pnlPercent * 100) / 100,
      });
    } catch (e) {
      // no-op
    }
  }, [paperBalance, heldQty, tradePricePerContract]);

  const handleBuy = () => {
    if (!contract || !contractKey) return;
    const totalCost = tradePricePerContract * quantity + feePerContract * quantity;
    if (totalCost > paperBalance) {
      toast.error('Insufficient virtual balance');
      return;
    }
    const newBalance = paperBalance - totalCost;
    const positions = getPositions();
    const current = positions[contractKey] || { quantity: 0, avgCost: 0, realizedPnL: 0 };
    const newQty = current.quantity + quantity;
    // average cost update on buy (price excludes fees in avg cost)
    const newAvgCost = newQty > 0
      ? (current.quantity * current.avgCost + quantity * tradePricePerContract) / newQty
      : 0;
    positions[contractKey] = { quantity: newQty, avgCost: newAvgCost, realizedPnL: current.realizedPnL };
    setPaperBalance(newBalance);
    setHeldQty(newQty);
    setAvgCost(newAvgCost);
    setRealizedPnL(current.realizedPnL);
    savePaperState(newBalance, positions);
    setLastTrade({ side: 'BUY', qty: quantity, pricePerContract: tradePricePerContract, fees: feePerContract * quantity, total: totalCost });
    toast.success(`Bought ${quantity} contract(s) for $${totalCost.toLocaleString()}`);
  };

  const handleSell = () => {
    if (!contract || !contractKey) return;
    if (quantity > heldQty) {
      toast.error('Not enough contracts to sell');
      return;
    }
    const grossProceeds = tradePricePerContract * quantity;
    const fees = feePerContract * quantity;
    const totalCredit = grossProceeds - fees;
    const positions = getPositions();
    const current = positions[contractKey] || { quantity: 0, avgCost: 0, realizedPnL: 0 };
    const perContractPnL = (tradePricePerContract - current.avgCost);
    const pnlOnThisSell = perContractPnL * quantity;
    const newRealized = (current.realizedPnL || 0) + pnlOnThisSell;
    const newQty = current.quantity - quantity;
    const newBalance = paperBalance + totalCredit;
    const newAvg = newQty > 0 ? current.avgCost : 0;
    positions[contractKey] = { quantity: Math.max(0, newQty), avgCost: newAvg, realizedPnL: newRealized };
    setPaperBalance(newBalance);
    setHeldQty(Math.max(0, newQty));
    setAvgCost(newAvg);
    setRealizedPnL(newRealized);
    savePaperState(newBalance, positions);
    setLastTrade({
      side: 'SELL',
      qty: quantity,
      pricePerContract: tradePricePerContract,
      fees,
      total: totalCredit,
      pnl: pnlOnThisSell,
      avgCostAtTrade: current.avgCost,
      perContractPnL,
    });
    toast.success(`Sold ${quantity} contract(s) for $${totalCredit.toLocaleString()} (fees $${fees.toLocaleString()})`);
  };

  const handleReset = () => {
    const positions = getPositions();
    if (contractKey && positions[contractKey]) {
      delete positions[contractKey];
    }
    const newBalance = 100000;
    setPaperBalance(newBalance);
    setHeldQty(0);
    setAvgCost(0);
    setRealizedPnL(0);
    savePaperState(newBalance, positions);
    toast.success('Paper trading state reset');
  };

  const checkFirstAnalysis = () => {
    const hasAnalyzedBefore = localStorage.getItem('hasAnalyzedBefore');
    if (!hasAnalyzedBefore) {
      localStorage.setItem('hasAnalyzedBefore', 'true');
      setTimeout(() => setShowGamification(true), 2000);
    }
  };

  const analyzeContract = async () => {
    if (!contract || analysisRunning.current) return;

    analysisRunning.current = true;
    setLoading(true);
    try {
      console.log('Starting analysis for contract:', contractKey);

      // Get current market price - same for both calls and puts to be realistic
      // Calculate realistic underlying price based on option premium and Black-Scholes approximation
      const calculateImpliedUnderlyingPrice = (strike: number, premium: number, optionType: 'call' | 'put', iv: number, timeToExpiry: number) => {
        const riskFreeRate = 0.05;

        // For ATM options, intrinsic value should be close to 0, so premium ≈ time value
        // Use this to estimate how far ITM/OTM the option currently is

        if (optionType === 'call') {
          // For calls: if premium > time_value, option is ITM
          // Rough approximation: time_value ≈ S * iv * sqrt(T) / sqrt(2π) for ATM
          const approxTimeValue = strike * iv * Math.sqrt(timeToExpiry) * 0.4;
          const intrinsicValue = Math.max(0, premium - approxTimeValue);
          return strike + intrinsicValue; // S = K + intrinsic for calls
        } else {
          // For puts: similar logic but reversed
          const approxTimeValue = strike * iv * Math.sqrt(timeToExpiry) * 0.4;
          const intrinsicValue = Math.max(0, premium - approxTimeValue);
          return strike - intrinsicValue; // S = K - intrinsic for puts
        }
      };

      const timeToExpiryYears = Math.ceil((new Date(contract.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) / 365;
      const impliedUnderlyingPrice = calculateImpliedUnderlyingPrice(
        contract.strike,
        contract.premium,
        contract.option_type,
        contract.iv,
        timeToExpiryYears
      );

      const request: AnalysisRequest = {
        option_type: contract.option_type,
        strike: contract.strike,
        premium: contract.premium,
        underlying: impliedUnderlyingPrice,
        expiry_days: Math.ceil((new Date(contract.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        iv: contract.iv,
      };

      const result = await apiService.analyzeOption(request);
      setAnalysis(result);
      console.log('Analysis completed successfully');
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis(null);
    } finally {
      setLoading(false);
      analysisRunning.current = false;
    }
  };

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Contract Selected</h2>
          <p className="text-muted-foreground mb-4">Please select a contract to analyze.</p>
          <Button onClick={() => navigate('/contracts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/contracts')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                {contract.underlying} ${contract.strike} {contract.option_type.toUpperCase()}
              </h1>
              <p className="text-muted-foreground">
                <span className="font-medium text-primary">Expires {new Date(contract.expiration).toLocaleDateString()} • Premium ${formatPremium(contract.premium)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Virtual Trading Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">Virtual Balance</div>
            <div className="text-2xl font-bold">${paperBalance.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Trade price/contract: ${tradePricePerContract.toLocaleString()} • Fee/contract: ${feePerContract.toLocaleString()}</div>
          </Card>
          <Card className="p-4 flex flex-col gap-3">
            <div className="text-sm text-muted-foreground">Your Position (this contract)</div>
            <div className="text-2xl font-bold">{heldQty} contract(s)</div>
            <div className="text-sm">Avg cost/contract: ${avgCost.toLocaleString()}</div>
            <div className="text-sm">Unrealized PnL: ${((tradePricePerContract - avgCost) * heldQty).toLocaleString()}</div>
            <div className="text-sm">Realized PnL: ${realizedPnL.toLocaleString()}</div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-24 border rounded px-2 py-1"
            />
            <Button onClick={handleBuy} className="flex-1">Buy</Button>
            <Button variant="outline" onClick={handleSell} className="flex-1">Sell</Button>
            <Button variant="secondary" onClick={handleReset}>Reset</Button>
          </Card>
          {lastTrade && (
            <Card className="md:col-span-3 p-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="font-semibold">Last Trade:</div>
                <div className={lastTrade.side === 'BUY' ? 'text-blue-600' : 'text-green-600'}>{lastTrade.side}</div>
                <div>Qty: <span className="font-mono">{lastTrade.qty}</span></div>
                <div>{lastTrade.side === 'BUY' ? 'Cost/contract' : 'Sell price/contract'}: <span className="font-mono">${lastTrade.pricePerContract.toLocaleString()}</span></div>
                {lastTrade.side === 'SELL' && (
                  <>
                    <div>Avg cost/contract: <span className="font-mono">${(lastTrade.avgCostAtTrade || 0).toLocaleString()}</span></div>
                    <div>Gain/Loss per contract: <span className={`font-mono ${((lastTrade.perContractPnL || 0) >= 0) ? 'text-green-600' : 'text-red-600'}`}>${(lastTrade.perContractPnL || 0).toLocaleString()}</span></div>
                  </>
                )}
                <div>Fees: <span className="font-mono">${lastTrade.fees.toLocaleString()}</span></div>
                <div>Total {lastTrade.side === 'BUY' ? 'Cost' : 'Proceeds'}: <span className="font-mono">${lastTrade.total.toLocaleString()}</span></div>
                {typeof lastTrade.pnl === 'number' && (
                  <div>Trade PnL: <span className={`font-mono ${lastTrade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>${lastTrade.pnl.toLocaleString()}</span></div>
                )}
              </div>
            </Card>
          )}

          {/* What-if Sell Simulator */}
          {analysis && (
            <Card className="md:col-span-3 p-4 space-y-3">
              <div className="font-semibold">What-if Sell (Imagined Future)</div>
              <div className="text-sm text-muted-foreground">Choose a hypothetical underlying price to estimate your sell outcome using the payoff curve.</div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm">Underlying price:</label>
                <input
                  type="number"
                  step={0.01}
                  value={whatIfPrice ?? ''}
                  onChange={(e) => setWhatIfPrice(Number(e.target.value))}
                  className="w-32 border rounded px-2 py-1"
                />
                {whatIfPrice != null && (
                  (() => {
                    const plPerShare = findNearestPlPerShare(whatIfPrice);
                    // Approx option value per share at that point = premium + plPerShare
                    const estValuePerShare = Math.max(0, (contract?.premium || 0) + plPerShare);
                    const estSellPerContract = estValuePerShare * contractMultiplier;
                    const estPerContractPnL = estSellPerContract - avgCost; // vs current avg cost
                    const estFees = feePerContract * quantity;
                    const estTotalProceeds = estSellPerContract * quantity - estFees;
                    const estTradePnL = (estSellPerContract - avgCost) * quantity;
                    return (
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div>Est. sell/contract: <span className="font-mono">${estSellPerContract.toLocaleString()}</span></div>
                        <div>Gain/Loss per contract: <span className={`font-mono ${estPerContractPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>${estPerContractPnL.toLocaleString()}</span></div>
                        <div>Fees: <span className="font-mono">${estFees.toLocaleString()}</span></div>
                        <div>Total proceeds (qty {quantity}): <span className="font-mono">${estTotalProceeds.toLocaleString()}</span></div>
                        <div>Trade PnL (qty {quantity}): <span className={`font-mono ${estTradePnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>${estTradePnL.toLocaleString()}</span></div>
                      </div>
                    );
                  })()
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Alert Bar - matches AI insight logic */}
        {analysis && Math.abs(analysis.greeks.theta) > 5 && (
          <AlertBar
            message="⚠️ High time decay risk! This option loses significant value daily."
            type="warning"
          />
        )}

        {/* Main Analysis Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </Card>
            ))}
          </div>
        ) : analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <PayoffChart data={analysis.payoff_curve} breakeven={analysis.breakeven} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MonteCarloChart 
                payoffCurve={analysis.payoff_curve}
                bands={analysis.bands}
                probabilityOfProfit={analysis.probability_of_profit}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <GreeksCard greeks={analysis.greeks} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <InsightCard 
                insight={analysis.insight}
                probabilityOfProfit={analysis.probability_of_profit}
              />
            </motion.div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load analysis</p>
          </Card>
        )}
      </motion.div>

      {/* Gamification Pop-up */}
      {showGamification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowGamification(false)}
        >
          <Card className="p-8 text-center max-w-md mx-4 glow">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Award className="h-16 w-16 text-primary mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold gradient-text mb-2">
              Options Explorer Level 1 🏅
            </h3>
            <p className="text-muted-foreground mb-4">
              Congratulations! You've completed your first options analysis.
            </p>
            <Button onClick={() => setShowGamification(false)}>
              Continue Exploring
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}