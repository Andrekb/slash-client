import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAllStockData } from "../../services/stockService";
import StockChart from "../../components/charts/StockChart";
import StockCards from "../../components/charts/StockCard";
import type { StockDataPoint } from "../../services/stockService";

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedStock, setSelectedStock] = useState("AAPL");
    const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">(
        "1M"
    );
    const [stockData, setStockData] = useState<Record<string, string>>({});
    const [historyData, setHistoryData] = useState<StockDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const transformHistoryData = (data: any[]): StockDataPoint[] => {
        if (!data || !Array.isArray(data)) return [];

        return data
            .map((item) => ({
                date: item.date,
                open: Number(item.open) || 0,
                high: Number(item.high) || 0,
                low: Number(item.low) || 0,
                close: Number(item.close) || 0,
                volume: Number(item.volume) || 0,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const filterByTimeRange = (data: StockDataPoint[], range: string) => {
        if (!data || !Array.isArray(data)) return [];

        const now = new Date();
        let cutoffDate = new Date();

        switch (range) {
            case "1D":
                cutoffDate.setDate(now.getDate() - 1);
                break;
            case "1W":
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case "1M":
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case "3M":
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
            case "1Y":
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return data;
        }

        return data.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate && itemDate <= now;
        });
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const allData = await fetchAllStockData();
                const stocksMap = allData.reduce(
                    (acc: Record<string, string>, stock: any) => {
                        acc[stock.symbol] = stock.symbol;
                        return acc;
                    },
                    {}
                );
                setStockData(stocksMap);
                const initialStock = allData.find(
                    (s: any) => s.symbol === selectedStock
                );
                if (initialStock) {
                    const transformed = transformHistoryData(initialStock.data);
                    const filtered = filterByTimeRange(transformed, timeRange);
                    setHistoryData(filtered);
                }
            } catch (error) {
                console.error("Failed to load stock data:", error);
                setError("Failed to load stock data");
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setLoading(true);
            try {
                const allData = await fetchAllStockData();
                if (isMounted) {
                    const selectedStockData = allData.find(stock => stock.symbol === selectedStock);
                    if (selectedStockData) {
                        const transformedData = transformStockData(selectedStockData.data);
                        const filteredData = filterDataByTimeRange(transformedData, timeRange);
                        setHistoryData(filteredData);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setError(`Failed to load data for ${selectedStock}`);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [selectedStock, timeRange]);

    const transformStockData = (data: any[]): StockDataPoint[] => {
        return data.map(item => ({
            date: item.date,
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
            volume: Number(item.volume)
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const filterDataByTimeRange = (data: StockDataPoint[], range: string): StockDataPoint[] => {
        const now = new Date();
        let days = 30;
        switch(range) {
            case '1D': days = 1; break;
            case '1W': days = 7; break;
            case '3M': days = 90; break;
            case '1Y': days = 365; break;
        }
        const cutoff = new Date(now.setDate(now.getDate() - days));
        return data.filter(item => new Date(item.date) >= cutoff);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (error && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
                    <h2 className="text-xl font-bold mb-4">Error Loading Data</h2>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Stock Dashboard</h1>
                            <p className="text-sm text-gray-400">
                                Welcome back, {user?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </header>
            <main className="p-4 md:p-6">
                {loading && !historyData.length ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <StockCards
                            stocks={stockData}
                            selectedStock={selectedStock}
                            onSelectStock={setSelectedStock}
                        />
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <StockChart
                                    key={`${selectedStock}-${timeRange}`}
                                    symbol={selectedStock}
                                    data={historyData}
                                    timeRange={timeRange}
                                    onTimeRangeChange={setTimeRange}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
