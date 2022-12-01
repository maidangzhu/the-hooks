import { useLayoutEffect, useCallback, useRef } from "react";

/**
 * https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
 * 只需传入函数即可，会保证全局唯一的引用，所以也不需要再考虑添加各种dependencies了
 * 升react18前的过度方案，也可以用ahooks的useMemoizedFn
 * @param handler 缓存的函数
 */
function useEvent(handler: any) {
  const handlerRef = useRef(null);

  useLayoutEffect(() => {
    // @ts-ignore
    handlerRef.current = handler;
  });

  return useCallback((...args) => {
    const fn = handlerRef.current;
    // @ts-ignore
    return fn(...args);
  }, []);
}

export { useEvent };
