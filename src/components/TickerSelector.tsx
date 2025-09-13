import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TICKER_CATEGORIES, getAllTickers, findTickerBySymbol, type TickerData } from "@/data/tickers";

interface TickerSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

interface FilteredData {
  categories: typeof TICKER_CATEGORIES;
  flatResults: TickerData[];
}

export function TickerSelector({ value, onValueChange, className }: TickerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter data based on search term
  const getFilteredData = (): FilteredData => {
    if (!searchTerm.trim()) {
      return {
        categories: TICKER_CATEGORIES,
        flatResults: []
      };
    }

    const search = searchTerm.toLowerCase().trim();
    const allTickers = getAllTickers();
    
    // Get all matching tickers
    const matchingTickers = allTickers.filter(ticker =>
      ticker.ticker.toLowerCase().includes(search) ||
      ticker.name.toLowerCase().includes(search)
    );

    // Group matching tickers by category
    const filteredCategories: typeof TICKER_CATEGORIES = {};
    Object.entries(TICKER_CATEGORIES).forEach(([category, tickers]) => {
      const categoryMatches = tickers.filter(ticker =>
        ticker.ticker.toLowerCase().includes(search) ||
        ticker.name.toLowerCase().includes(search)
      );
      
      if (categoryMatches.length > 0) {
        filteredCategories[category] = categoryMatches;
      }
    });

    return {
      categories: filteredCategories,
      flatResults: matchingTickers
    };
  };

  const filteredData = getFilteredData();
  const isSearching = searchTerm.trim().length > 0;

  // Handle selection
  const handleSelect = (tickerOrCategory: string) => {
    onValueChange(tickerOrCategory);
    setOpen(false);
    setSearchTerm("");
    setActiveCategory(null);
  };

  // Get display value
  const getDisplayValue = () => {
    if (!value) return "Select ticker or sector...";
    
    // Check if it's a ticker
    const tickerData = findTickerBySymbol(value);
    if (tickerData) {
      return `${tickerData.name} (${tickerData.ticker})`;
    }
    
    // Check if it's a category
    if (TICKER_CATEGORIES[value]) {
      return value;
    }
    
    return value;
  };

  // Reset active category when opening/closing
  useEffect(() => {
    if (!open) {
      setActiveCategory(null);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate text-left">{getDisplayValue()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col max-h-[400px]">
          {/* Search Input */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticker or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {isSearching ? (
              /* Search Results */
              <div className="p-2 max-h-[320px] overflow-y-auto">
                {filteredData.flatResults.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No results found for "{searchTerm}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredData.flatResults.map((ticker) => (
                      <button
                        key={ticker.ticker}
                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => handleSelect(ticker.ticker)}
                      >
                        <div className="font-medium">{ticker.name}</div>
                        <div className="text-xs text-muted-foreground">({ticker.ticker})</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Category Browser - Mega Menu Style */
              <div 
                className="relative flex"
                onMouseLeave={() => setActiveCategory(null)}
              >
                {/* Main Categories */}
                <div className="w-1/2 border-r max-h-[320px] overflow-y-auto">
                  {Object.keys(TICKER_CATEGORIES).map((category) => (
                    <div
                      key={category}
                      onMouseEnter={() => setActiveCategory(category)}
                    >
                      <button
                        className={cn(
                          "w-full text-left px-3 py-3 text-sm border-b hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between",
                          activeCategory === category && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleSelect(category)}
                      >
                        <span className="font-medium">{category}</span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ticker Submenu */}
                <div className="w-1/2 max-h-[320px] overflow-y-auto">
                  {activeCategory && TICKER_CATEGORIES[activeCategory] && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        {activeCategory}
                      </div>
                      <div className="space-y-1">
                        {TICKER_CATEGORIES[activeCategory].map((ticker) => (
                          <button
                            key={ticker.ticker}
                            className="w-full text-left px-2 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={() => handleSelect(ticker.ticker)}
                          >
                            <div className="font-medium text-xs">{ticker.name}</div>
                            <div className="text-xs text-muted-foreground">({ticker.ticker})</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!activeCategory && (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      Hover over a category to see tickers
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}