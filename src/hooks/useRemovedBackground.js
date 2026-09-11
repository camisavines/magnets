import { useReducer, useEffect, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';

function reducer(state, action) {
  switch (action.type) {
    case 'done':
      return { objectUrl: action.url, processingUrl: null };
    case 'error':
      return { objectUrl: null, processingUrl: null };
    default:
      return state;
  }
}

/**
 * Runs background removal on `imageUrl` and returns a local object URL
 * pointing to the resulting transparent PNG.
 *
 * - While processing, `loading` is true and `objectUrl` is null.
 * - On error or when `imageUrl` is falsy, `loading` is false and
 *   `objectUrl` is null (caller should fall back to the original src).
 * - The object URL is revoked automatically when the component unmounts
 *   or when `imageUrl` changes.
 *
 * Pass `null` or `undefined` to skip processing entirely.
 */
export function useRemovedBackground(imageUrl) {
  const [state, dispatch] = useReducer(reducer, { objectUrl: null, processingUrl: null });
  const prevObjectUrl = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;

    let cancelled = false;

    removeBackground(imageUrl)
      .then((blob) => {
        if (cancelled) return;
        if (prevObjectUrl.current) {
          URL.revokeObjectURL(prevObjectUrl.current);
        }
        const url = URL.createObjectURL(blob);
        prevObjectUrl.current = url;
        dispatch({ type: 'done', url });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'error' });
      });

    return () => {
      cancelled = true;
      if (prevObjectUrl.current) {
        URL.revokeObjectURL(prevObjectUrl.current);
        prevObjectUrl.current = null;
      }
    };
  }, [imageUrl]);

  // `loading` is true when we have a URL to process but haven't finished yet.
  // processingUrl being null (initial) while imageUrl is set means in-flight.
  const loading = Boolean(imageUrl) && state.objectUrl === null && state.processingUrl === null;

  return { objectUrl: state.objectUrl, loading };
}
