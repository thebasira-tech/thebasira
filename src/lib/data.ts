export type Stock = {
    symbol: string;
    name: string;
    price: number;
    change_1h: number;
    change_1d: number;
    change_7d: number;
    volume: number;
    marketCap: number;
    sector: string;
    description: string;
  };
  
  export type IndexRow = {
    symbol: string;
    name: string;
    value: number;
    change: number;
  };
  
  export const stocks: Stock[] = [
    {
      symbol: "MTNN",
      name: "MTN Nigeria Communications Plc",
      price: 245.6,
      change_1h: 0.12,
      change_1d: 1.82,
      change_7d: 4.6,
      volume: 12450000,
      marketCap: 5100000000000,
      sector: "Telecoms",
      description: "MTN Nigeria Communications Plc is Nigeria’s largest telecom operator.",
    },
    {
      symbol: "GTCO",
      name: "Guaranty Trust Holding Company Plc",
      price: 41.85,
      change_1h: -0.45,
      change_1d: 1.82,
      change_7d: 4.6,
      volume: 18500000,
      marketCap: 1230000000000,
      sector: "Banking",
      description: "GTCO is a leading Nigerian financial services group.",
    },
    {
      symbol: "BUACEMENT",
      name: "BUA Cement Plc",
      price: 112.3,
      change_1h: 0.94,
      change_1d: 1.82,
      change_7d: 4.6,
      volume: 5200000,
      marketCap: 3800000000000,
      sector: "Industrial Goods",
      description: "BUA Cement Plc is a major cement manufacturer in Nigeria.",
    },
  ];
  
  export const indices: IndexRow[] = [
    { symbol: "NGXASI", name: "NGX All-Share Index", value: 78952.34, change: 0.67 },
    { symbol: "NGX30", name: "NGX 30 Index", value: 3124.18, change: 0.54 },
    { symbol: "NGXBANK", name: "NGX Banking Index", value: 682.41, change: -0.21 },
  ];

  export type Etf = {
    symbol: string;
    name: string;
    price: number;
    change_ytd: number; // % change since Jan 1 (simulated for now)
    volume: number;
    marketCap: number;
  };
  
  export const etfs: Etf[] = [
    {
      symbol: "NEWGOLD",
      name: "NewGold ETF",
      price: 29500,
      change_ytd: 12.4,
      volume: 1850,
      marketCap: 185000000000,
    },
    {
      symbol: "IVZNG",
      name: "InvestNow Nigerian Equity ETF (Example)",
      price: 125.4,
      change_ytd: 6.8,
      volume: 420000,
      marketCap: 98000000000,
    },
    {
      symbol: "AFR30",
      name: "Africap NGX 30 Tracker ETF (Example)",
      price: 88.2,
      change_ytd: -1.9,
      volume: 210000,
      marketCap: 54000000000,
    },
  ];
  
  export const getStockBySymbol = (symbol?: string) => {
    if (!symbol) return undefined;
    const key = symbol.toUpperCase();
    return stocks.find((s) => s.symbol.toUpperCase() === key);
  };  
  
  export const formatNaira = (value: number) => `₦${value.toLocaleString("en-NG")}`;
  