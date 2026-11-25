// =============================================================
//  useDebounce - wait until the user stops typing before searching
//  (avoids sending one API request for every key press)
// =============================================================
import { useEffect, useState } from 'react';

export default function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
