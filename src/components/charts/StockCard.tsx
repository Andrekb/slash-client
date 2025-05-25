import React from 'react';

interface StockCardsProps {
  stocks: Record<string, string>;
  selectedStock: string;
  onSelectStock: (symbol: string) => void;
}

const StockCards: React.FC<StockCardsProps> = ({ 
  stocks, 
  selectedStock, 
  onSelectStock 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Object.entries(stocks).map(([symbol, name]) => (
        <button
          key={symbol}
          onClick={() => onSelectStock(symbol)}
          className={`p-4 rounded-lg transition-all ${
            selectedStock === symbol
              ? 'bg-blue-600 shadow-lg transform scale-105'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <h3 className="font-bold">{symbol}</h3>
          <p className="text-sm text-gray-300 truncate">{name}</p>
        </button>
      ))}
    </div>
  );
};

export default StockCards;