import { FIT_IMAGE } from "@/utils";
import { useEffect, useState } from "react";

const useImageLoad = (originSrc?: string, width?: number) => {
  const [imgMeta, setImgMeta] = useState<{
    src: string;
    width: number;
    height: number;
  }>();

  useEffect(() => {
    if (!originSrc) return () => {};

    const img = new Image();

    let url = originSrc;
    if (width) {
      url = FIT_IMAGE(url, width);
    }

    img.src = url;
    img.onload = () => {
      setImgMeta({
        src: originSrc,
        width: img.width,
        height: img.height,
      });
    };

    return () => {
      img.src = "";
    };
  }, [originSrc, width]);

  return [imgMeta];
};

export { useImageLoad };
