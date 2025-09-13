import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, TrendingUp, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ContractData } from "@/utils/api-service";
import { useNavigate } from "react-router-dom";
import { formatPremium, formatPrice, formatPercentage } from "@/utils/formatting";

interface ContractTableProps {
  contracts: ContractData[];
  loading: boolean;
  ticker: string;
  expiry: string;
}

type SortField = 'strike' | 'premium' | 'iv' | 'oi';
type SortDirection = 'asc' | 'desc';

export function ContractTable({ contracts, loading, ticker, expiry }: ContractTableProps) {
  const [sortField, setSortField] = useState<SortField>('strike');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const navigate = useNavigate();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedContracts = [...contracts].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'oi') {
      aValue = a.oi || 0;
      bValue = b.oi || 0;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleAnalyze = (contract: ContractData) => {
    navigate(`/analysis?contract=${encodeURIComponent(JSON.stringify({
      contractId: contract.contractId,
      strike: contract.strike,
      option_type: contract.option_type,
      premium: contract.premium,
      iv: contract.iv,
      expiration: contract.expiration,
      underlying: contract.underlying,
    }))}`);
  };

  if (loading) {
    return (
      <Card className="card-gradient">
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-gradient overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {ticker} Options - {new Date(expiry).toLocaleDateString()}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSort('strike')}
                >
                  <div className="flex items-center gap-1">
                    Strike
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSort('premium')}
                >
                  <div className="flex items-center gap-1">
                    Premium
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSort('iv')}
                >
                  <div className="flex items-center gap-1">
                    IV
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSort('oi')}
                >
                  <div className="flex items-center gap-1">
                    OI
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.map((contract, index) => (
                <motion.tr
                  key={contract.contractId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-accent/30 transition-colors"
                >
                  <TableCell>
                    <Badge 
                      variant={contract.option_type === 'call' ? 'default' : 'secondary'}
                      className={contract.option_type === 'call' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}
                    >
                      {contract.option_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    ${formatPrice(contract.strike)}
                  </TableCell>
                  <TableCell className="font-mono">
                    ${formatPremium(contract.premium)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatPercentage(contract.iv)}%
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {contract.oi?.toLocaleString() || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleAnalyze(contract)}
                      className="hover:scale-105 transition-transform"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {contracts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No contracts found for {ticker} expiring {new Date(expiry).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
}