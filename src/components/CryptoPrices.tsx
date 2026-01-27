import React, { useEffect, useState } from 'react';
import { REFRESH_INTERVALS } from '../constants';

interface CryptoPrices {
  bitcoin: { usd: number, usd_24h_change: number };
  ethereum: { usd: number, usd_24h_change: number };
  solana: { usd: number, usd_24h_change: number };
}

const CryptoPrices: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrices | null>(null);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    // Fetch initial prices
    fetchCryptoPrices();

    // Update prices every minute
    const interval = setInterval(fetchCryptoPrices, REFRESH_INTERVALS.CRYPTO_PRICES);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Loading...';
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const PriceChange: React.FC<{ change: number }> = ({ change }) => {
    const isPositive = change > 0;
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    const arrow = isPositive ? '↑' : '↓';

    return (
      <span className={`${color} ml-2`}>
        {arrow} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="crypto-prices">
      <div className="crypto-price-item">
        <span className="crypto-symbol">BTC</span>
        <div className="crypto-price-info">
          <span className="crypto-price">
            {prices ? formatPrice(prices.bitcoin.usd) : 'Loading...'}
          </span>
          {prices && <PriceChange change={prices.bitcoin.usd_24h_change} />}
        </div>
      </div>
      <div className="crypto-price-item">
        <span className="crypto-symbol">ETH</span>
        <div className="crypto-price-info">
          <span className="crypto-price">
            {prices ? formatPrice(prices.ethereum.usd) : 'Loading...'}
          </span>
          {prices && <PriceChange change={prices.ethereum.usd_24h_change} />}
        </div>
      </div>
      <div className="crypto-price-item">
        <span className="crypto-symbol">SOL</span>
        <div className="crypto-price-info">
          <span className="crypto-price">
            {prices ? formatPrice(prices.solana.usd) : 'Loading...'}
          </span>
          {prices && <PriceChange change={prices.solana.usd_24h_change} />}
        </div>
      </div>
    </div>
  );
};

export default CryptoPrices;
