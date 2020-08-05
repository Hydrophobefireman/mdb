import {
  Component,
  h,
  useRef,
  useEffect,
  useState,
} from "@hydrophobefireman/ui-lib";
import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";
import assign from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/assign";

import CloudinaryImage from "./CloudinaryImage";

export default function OptimizedImage(props) {
  const { src, class: className, children, useImgTag, ...config } = props;
  /**@type {{current:CloudinaryImage}} */
  const [rawImage, setRawImage] = useState(false);
  const [imgURL, setURL] = useState(null);
  useEffect(async () => {
    if (!src || !src.includes("res.cloudinary")) return setRawImage(true);
    const image = new CloudinaryImage(src);
    const lowQual = image.set("w", 5).set("f", "auto").get();
    image.set("w", null);
    entries(config).forEach(([key, val]) => image.set(key, val));
    setRawImage(false);
    setURL(lowQual);
    await image.preloadImage();
    setURL(image.get());
  }, [src]);
  const height = config.h || config.height;
  const width = config.w || config.width;
  const style = { width: `${width}px`, height: `${height}px` };
  const $src = rawImage ? src : imgURL;
  if (!$src) return;
  return useImgTag
    ? h("img", { src: $src, className })
    : h("div", {
        class: ["opt-image"].concat(className),
        style: assign(style, { backgroundImage: `url(${$src})` }),
      });
}
