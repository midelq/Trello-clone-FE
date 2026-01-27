import React, { useEffect, useState } from 'react';
import { REFRESH_INTERVALS } from '../constants';

interface FearGreedData {
  value: string;
  value_classification: string;
}

const FearGreedIndex: React.FC = () => {
  const [data, setData] = useState<FearGreedData | null>(null);

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/');
        const result = await response.json();
        if (result.data && result.data[0]) {
          setData({
            value: result.data[0].value,
            value_classification: result.data[0].value_classification
          });
        }
      } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
      }
    };

    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, REFRESH_INTERVALS.FEAR_GREED);

    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const getEmoji = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'extreme fear': return '😱';
      case 'fear': return '😨';
      case 'neutral': return '😐';
      case 'greed': return '🤑';
      case 'extreme greed': return '🤪';
      default: return '🤔';
    }
  };

  return (
    <span className="fear-greed-index">
      F&G: {data.value} {getEmoji(data.value_classification)}
    </span>
  );
};

export default FearGreedIndex;


