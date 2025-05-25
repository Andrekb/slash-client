import React, { useEffect, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

interface StockDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface StockChartProps {
    symbol: string;
    data: StockDataPoint[];
    timeRange: "1D" | "1W" | "1M" | "3M" | "1Y";
    onTimeRangeChange: (range: "1D" | "1W" | "1M" | "3M" | "1Y") => void;
    loading?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({
    symbol,
    data,
    timeRange,
    onTimeRangeChange,
    loading = false,
}) => {
    console.log("StockChart recebeu:", {
        symbol,
        dataPoints: data.length,
        timeRange,
        loading,
    });

    const { processedData, avgClose } = useMemo(() => {
        if (!data || data.length === 0) {
            return { processedData: [], avgClose: 0 };
        }
        const filteredData = [...data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const average =
            filteredData.reduce((sum, point) => sum + point.close, 0) /
            filteredData.length;
        return {
            processedData: filteredData,
            avgClose: average,
        };
    }, [data, symbol, timeRange]);

    useEffect(() => {
        console.log(`Dados atualizados para ${symbol}:`, {
            receivedData: data,
            processedData,
            avgClose,
        });
    }, [data, processedData, symbol]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const point = payload[0].payload;
            return (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl">
                    <p className="font-bold text-lg mb-2">
                        {new Date(label).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-blue-400">
                            Open: <span className="text-white">${point.open.toFixed(2)}</span>
                        </div>
                        <div className="text-green-400">
                            High: <span className="text-white">${point.high.toFixed(2)}</span>
                        </div>
                        <div className="text-red-400">
                            Low: <span className="text-white">${point.low.toFixed(2)}</span>
                        </div>
                        <div className="text-purple-400">
                            Close:{" "}
                            <span className="text-white">${point.close.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2 text-gray-400">
                            Volume:{" "}
                            <span className="text-white">
                                {(point.volume / 1000000).toFixed(2)}M
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const formatXAxis = (tick: string) => {
        const date = new Date(tick);
        if (timeRange === "1D") {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!processedData || processedData.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 h-96 flex items-center justify-center">
                <p className="text-gray-400">No data available for {symbol}</p>
            </div>
        );
    }

    return (
        <div
            className="bg-gray-800 rounded-lg p-4 h-96"
            key={`chart-${symbol}-${timeRange}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                    {symbol} - {timeRange} Chart
                </h3>
                <div className="flex space-x-2">
                    {(["1D", "1W", "1M", "3M", "1Y"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-3 py-1 rounded-md text-sm ${
                                timeRange === range
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="90%">
                <AreaChart
                    data={processedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tickFormatter={formatXAxis}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        domain={["auto", "auto"]}
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                        y={avgClose}
                        stroke="#8B5CF6"
                        strokeDasharray="3 3"
                        label={{
                            value: `Avg $${avgClose.toFixed(2)}`,
                            fill: "#8B5CF6",
                            fontSize: 12,
                            position: "right",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorClose)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(StockChart);
