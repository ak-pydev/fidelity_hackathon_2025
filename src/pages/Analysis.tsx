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
        const positions: Record<string, number> = raw ? JSON.parse(raw) : {};
        setHeldQty(positions[contractKey] || 0);
      }
    } catch (e) {
      console.warn('Failed to load paper trading state', e);
    }
  }, [contractKey]);

  const savePaperState = (balance: number, positions: Record<string, number>) => {
    localStorage.setItem('paperBalance', String(balance));
    localStorage.setItem('paperPositions', JSON.stringify(positions));
  };

  const getPositions = (): Record<string, number> => {
    try {
      const raw = localStorage.getItem('paperPositions');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const contractMultiplier = 100; // equity option multiplier
  const currentCostPerContract = contract ? contract.premium * contractMultiplier : 0;

  const handleBuy = () => {
    if (!contract || !contractKey) return;
    const totalCost = currentCostPerContract * quantity;
    if (totalCost > paperBalance) {
      toast.error('Insufficient virtual balance');
      return;
    }
    const newBalance = paperBalance - totalCost;
    const positions = getPositions();
    const newQty = (positions[contractKey] || 0) + quantity;
    positions[contractKey] = newQty;
    setPaperBalance(newBalance);
    setHeldQty(newQty);
    savePaperState(newBalance, positions);
    toast.success(`Bought ${quantity} contract(s) for $${totalCost.toLocaleString()}`);
  };

  const handleSell = () => {
    if (!contract || !contractKey) return;
    if (quantity > heldQty) {
      toast.error('Not enough contracts to sell');
      return;
    }
    const totalCredit = currentCostPerContract * quantity;
    const newBalance = paperBalance + totalCredit;
    const positions = getPositions();
    const newQty = (positions[contractKey] || 0) - quantity;
    positions[contractKey] = Math.max(0, newQty);
    setPaperBalance(newBalance);
    setHeldQty(Math.max(0, newQty));
    savePaperState(newBalance, positions);
    toast.success(`Sold ${quantity} contract(s) for $${totalCredit.toLocaleString()}`);
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
            <div className="text-xs text-muted-foreground">Cost/contract: ${currentCostPerContract.toLocaleString()}</div>
          </Card>
          <Card className="p-4 flex flex-col gap-3">
            <div className="text-sm text-muted-foreground">Your Position (this contract)</div>
            <div className="text-2xl font-bold">{heldQty} contract(s)</div>
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
          </Card>
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