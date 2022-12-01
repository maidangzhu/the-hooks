import { useCallback, useRef, useState } from "react";

export const useLazyCallback = <T extends (...args: any[]) => any>(
  func: T,
  delay = 300,
  defaultLoading = false,
) => {
  const loadingRef = useRef(false);

  const [loading, setLoading] = useState(defaultLoading);

  const handleSubmit = useCallback(
    (...args: Parameters<T>) => {
      if (loadingRef.current) return;

      loadingRef.current = true;

      let token: ReturnType<typeof setTimeout> | null = null;
      const clearToken = () => {
        loadingRef.current = false;

        if (token !== null) {
          setLoading(false);
          clearTimeout(token);
        }
      };

      if (delay > 0) {
        token = setTimeout(() => setLoading(true), delay);
      }
      return func(...args).then(
        // @ts-ignore
        (data) => {
          clearToken();

          return data;
        },
        // @ts-ignore
        (error) => {
          clearToken();

          return Promise.reject(error);
        },
      );
    },
    [func, delay],
  );

  return [loading, handleSubmit] as [boolean, T];
};
