import React, { useEffect, useRef, useState } from 'react';
import { Coins, RotateCw } from 'lucide-react';

interface TreasuryPanelProps {
  gold: number;
  isLoading: boolean;
  onRefresh: () => void | Promise<void>;
}

export const TreasuryPanel: React.FC<TreasuryPanelProps> = ({
  gold,
  isLoading,
  onRefresh,
}) => {
  // Animated smooth number interpolation when gold balance changes
  const [displayGold, setDisplayGold] = useState<number>(gold);
  const prevGoldRef = useRef<number>(gold);

  useEffect(() => {
    const startVal = prevGoldRef.current;
    const endVal = gold;

    if (startVal === endVal) {
      setDisplayGold(endVal);
      return;
    }

    prevGoldRef.current = endVal;
    const duration = 650;
    const startTime = performance.now();

    let animationFrameId: number;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startVal + (endVal - startVal) * easeProgress);

      setDisplayGold(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setDisplayGold(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gold]);

  return (
    <div className="armory-treasury-cluster">
      {/* Authoritative Treasury Balance Container */}
      <div className="armory-treasury-pod" aria-label={`Treasury Balance: ${gold} Gold`}>
        <div className="armory-treasury-coin-wrap" aria-hidden="true">
          <Coins size={20} color="var(--color-gold, #f59e0b)" />
        </div>

        <div>
          <div className="armory-treasury-label">
            Treasury Balance
          </div>
          <div className="armory-treasury-value">
            <span className="mono-numbers">{displayGold.toLocaleString()}</span>
            <span className="armory-treasury-currency">Gold</span>
          </div>
        </div>
      </div>

      {/* Futuristic System Sync / Refresh Button */}
      <button
        type="button"
        onClick={() => void onRefresh()}
        disabled={isLoading}
        className="armory-sync-button"
        aria-label="Refresh shop catalog"
        title="Sync Armory Catalog"
      >
        <RotateCw
          size={18}
          className={`sync-icon-rotate ${isLoading ? 'sync-icon-spinning' : ''}`}
        />
      </button>
    </div>
  );
};
