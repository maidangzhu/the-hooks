import { useRef } from "react";

// 用于获取最新的值
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export { useLatest };
