import { useEffect, useState } from 'react';

// ─── FlashSaleBanner ──────────────────────────────────────────────────────────
// Displays a countdown timer for the flash sale.
// The end time is set 24 hours from when the component first mounts.
// In a real app you'd get this timestamp from your backend.

function getEndTime() {
  // Check if we stored an end time already (survives page refresh)
  const stored = localStorage.getItem('aether-sale-end');
  if (stored) return parseInt(stored, 10);
  // Otherwise set it 24 hours from now
  const end = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem('aether-sale-end', end);
  return end;
}

export default function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const endTime = getEndTime();

    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };

    tick(); // run immediately
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flash-sale-banner">
      <span className="flash-icon">⚡</span>
      <span className="flash-label">Flash Sale — Selected items up to 20% OFF</span>
      <div className="flash-timer">
        <span className="timer-label">Ends in</span>
        <span className="timer-block">{pad(timeLeft.h)}<small>h</small></span>
        <span className="timer-sep">:</span>
        <span className="timer-block">{pad(timeLeft.m)}<small>m</small></span>
        <span className="timer-sep">:</span>
        <span className="timer-block">{pad(timeLeft.s)}<small>s</small></span>
      </div>
    </div>
  );
}
