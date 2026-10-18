import { useCallback, useState } from 'react';

/** A best score kept in this browser. Storage can be refused; then it just is not kept. */
export default function useBest(key) {
  const read = () => {
    try { return Number(localStorage.getItem(`best:${key}`)) || 0; } catch { return 0; }
  };
  const [best, setBest] = useState(read);
  const offer = useCallback((score) => {
    setBest((b) => {
      if (score <= b) return b;
      try { localStorage.setItem(`best:${key}`, String(score)); } catch { /* not kept */ }
      return score;
    });
  }, [key]);
  return [best, offer];
}
