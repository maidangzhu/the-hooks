import { useEffect, useState } from "react";

const useDetectSpider = () => {
  const { userAgent } = window.navigator;

  const [isSpider, setSpider] = useState(false);

  useEffect(() => {
    if (!userAgent.includes("HeadlessChrome")) {
      setSpider(true);
    }
  }, [userAgent]);

  return [isSpider];
};

export { useDetectSpider };
