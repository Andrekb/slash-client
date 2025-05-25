import api from './api';

export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

let cachedData: any = null;

export const fetchAllStockData = async (forceRefresh = false): Promise<any[]> => {
  if (cachedData && !forceRefresh) {
    return cachedData;
  }

  try {
    const response = await api.get('/stocks');
    cachedData = response.data;
    return cachedData;
  } catch (error) {
    console.error('Error fetching all stocks data:', error);
    throw error;
  }
};

export const getAvailableStocks = async () => {
  const data = await fetchAllStockData();
  return data.reduce((acc: Record<string, string>, stock: any) => {
    acc[stock.symbol] = stock.symbol;
    return acc;
  }, {});
};

export const getStockHistory = async (symbol: string) => {
  const data = await fetchAllStockData();
  const stock = data.find((s: any) => s.symbol === symbol);
  return stock ? stock.data : [];
};