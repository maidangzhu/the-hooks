import type { CancelTokenSource } from "axios";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { unstable_batchedUpdates as batch } from "react-dom";

import axios from "axios";

const { CancelToken } = axios;
const { isCancel } = axios;

/**
 * @param fetcher 请求处理函数
 * @param cancelMessage 取消请求时的message
 * @param defaultLoading 默认loading状态
 */
const useFetch = <Payload = object, Data = object>(
  fetcher: (
    payload: Payload, // 入参
    prevData: Data | undefined, // fetcher上一次执行的返回结果
    source: CancelTokenSource,
  ) => Promise<Data>,
  cancelMessage?: string,
  defaultLoading?: boolean
) => {
  const [data, setData] = useState<Data>();
  const [isLoading, setIsLoading] = useState(defaultLoading); // 默认就是loading
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error>();
  const [cacheFetcher] = useState(() => fetcher); // 暂存fetcher
  const [fetchData, setFetchData] = useState<{ id: number; payload?: Payload }>(
    {
      id: 0,
      payload: undefined,
    },
  );
  const cacheRef = useRef<{
    isLoading: boolean;
    prevData?: Data;
    prevPayload?: Payload;
  }>({
    isLoading: false,
    prevData: data,
    prevPayload: fetchData?.payload ?? undefined,
  });

  useMemo(() => {
    if (typeof isLoading === "boolean") {
      cacheRef.current.isLoading = isLoading;
    }
    cacheRef.current.prevData = data;
  }, [isLoading, data]);

  useEffect(() => {
    if (fetchData.id && fetchData.payload) {
      const source = CancelToken.source();
      cacheFetcher(fetchData.payload, cacheRef.current.prevData, source)
        .then((result) => {
          if (result) {
            batch(() => {
              setData(result);
              setIsLoading(false);
              /* 仅在成功请求重置 prevPayload */
              cacheRef.current.prevPayload = fetchData.payload;
            });
          }
        })
        .catch((caughtError) => {
          batch(() => {
            if (!isCancel(caughtError)) {
              console.error(caughtError);
              setIsLoading(false);
              setHasError(true);
              setError(caughtError);
            }
          });
        });
      return () => {
        source.cancel(cancelMessage);
      };
    }

    return () => {};
  }, [cacheFetcher, cancelMessage, fetchData]);

  /**
   * 假如payload函数返回false表示不再触发发送请求
   * 处理搜索时，重制列表
   */
  const dispatch = useCallback(
    (
      payloader:
        | Payload
        | ((options: {
            prevPayload?: Payload;
            isLoading: boolean;
            prevData?: Data;
          }) => Payload | false),
      resetData?: (data: Data | undefined) => Data | undefined,
    ) => {
      let payload: Payload;
      let cancel = false;
      if (payloader instanceof Function) {
        const state = payloader({
          prevPayload: cacheRef.current.prevPayload,
          isLoading: cacheRef.current.isLoading,
          prevData: cacheRef.current.prevData,
        });
        if (state === false) {
          cancel = true;
        } else {
          payload = state;
        }
      } else {
        payload = payloader;
      }

      batch(() => {
        if (!cancel) {
          setHasError(false);
          setError(undefined);
          setFetchData((prev) => {
            return { id: prev.id + 1, payload };
          });
          setIsLoading(true);
          if (typeof resetData === "function") {
            setData(resetData(cacheRef.current.prevData));
          } else {
            setData(undefined);
          }
        } else {
          if (typeof resetData === "function") {
            setData(resetData(cacheRef.current.prevData));
          }
        }
      });
    },
    [],
  );

  return [
    {
      data,
      error,
      isLoading,
      hasError,
      fetchData,
    },
    dispatch,
  ] as const;
};

export { useFetch };
