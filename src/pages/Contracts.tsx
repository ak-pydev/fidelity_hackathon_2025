import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ContractTable } from "@/components/ContractTable";
import { TickerSelector } from "@/components/TickerSelector";
import { apiService, type ContractData } from "@/utils/api-service";
import { expirationService, type ExpirationDate } from "@/utils/expiration-service";

export function Contracts() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("SPY");
  const [selectedExpiry, setSelectedExpiry] = useState("2024-10-18");
  const [expirations, setExpirations] = useState<ExpirationDate[]>([]);
  const [loadingExpirations, setLoadingExpirations] = useState(false);
  const [lastSuccessfulLoad, setLastSuccessfulLoad] = useState<string>("");

  useEffect(() => {
    const loadKey = `${selectedTicker}-${selectedExpiry}`;
    loadContracts(loadKey);
  }, [selectedTicker, selectedExpiry]);

  useEffect(() => {
    loadExpirations();
  }, [selectedTicker]);

  const loadContracts = async (loadKey: string) => {
    setLoading(true);
    try {
      const data = await apiService.getContracts(selectedTicker, selectedExpiry);
      
      // Only update state if this is still the current request
      const currentKey = `${selectedTicker}-${selectedExpiry}`;
      if (loadKey === currentKey) {
        setContracts(data);
        setLastSuccessfulLoad(loadKey);
      }
    } catch (error) {
      console.error("Failed to load contracts:", error);
      
      // Only update state if this is still the current request
      const currentKey = `${selectedTicker}-${selectedExpiry}`;
      if (loadKey === currentKey) {
        setContracts([]);
      }
    } finally {
      // Only update loading state if this is still the current request
      const currentKey = `${selectedTicker}-${selectedExpiry}`;
      if (loadKey === currentKey) {
        setLoading(false);
      }
    }
  };

  const loadExpirations = async () => {
    setLoadingExpirations(true);
    try {
      const data = await expirationService.getExpirations(selectedTicker);
      setExpirations(data);
      // Set first expiration as default if current selection not available
      if (data.length > 0 && !data.some(exp => exp.date === selectedExpiry)) {
        setSelectedExpiry(data[0].date);
      }
    } catch (error) {
      console.error("Failed to load expirations:", error);
      setExpirations([]);
    } finally {
      setLoadingExpirations(false);
    }
  };

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
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
              Options Explorer
            </h1>
            <p className="text-muted-foreground">
              Discover and analyze options contracts with live premium data
            </p>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-6 card-gradient">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ticker or Sector</label>
              <TickerSelector
                value={selectedTicker}
                onValueChange={setSelectedTicker}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiration Date</label>
              <Select 
                value={selectedExpiry} 
                onValueChange={setSelectedExpiry}
                disabled={loadingExpirations}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration date" />
                </SelectTrigger>
                <SelectContent>
                  {expirations.map((expiry) => (
                    <SelectItem key={expiry.date} value={expiry.date}>
                      {expiry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Contracts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ContractTable
            contracts={contracts}
            loading={loading}
            ticker={selectedTicker}
            expiry={selectedExpiry}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}