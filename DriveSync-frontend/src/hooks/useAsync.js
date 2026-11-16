// =============================================================
//  useAsync - run an API call and track { data, loading, error }
//
//  const { data, loading, error, reload } = useAsync(() => listPayments(filters), [filters]);
//
//  - Runs again whenever something in "deps" changes
//  - Ignores late answers from an older request (prevents flicker
//    when the user types fast in a search box)
// =============================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/httpClient';

export default function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const requestId = useRef(0);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await asyncFn();
      if (id === requestId.current) setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      if (id === requestId.current) setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run();
  }, [run, immediate]);

  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data })) };
}
