import { useState, useLayoutEffect } from "react";

const useRootFontSize = () => {
  const [size, setSize] = useState<number>(10);

  useLayoutEffect(() => {
    const rootFontSize = document.documentElement.style.fontSize;
    setSize(parseFloat(rootFontSize));
  }, [document.documentElement.style.fontSize]);

  return [size];
};

export { useRootFontSize };
