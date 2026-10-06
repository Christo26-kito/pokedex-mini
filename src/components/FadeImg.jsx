import { useEffect, useRef } from "react";

// <img> that fades in when its pixels are actually loaded — no abrupt pop-in,
// and cached images still fade gently on mount.
export default function FadeImg({ src, alt = "", className = "", pixelated = false, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const mark = () => img.classList.add("loaded");
    if (img.complete && img.naturalWidth > 0) {
      requestAnimationFrame(mark); // cached: paint once, then fade
    } else {
      img.addEventListener("load", mark, { once: true });
      img.addEventListener("error", mark, { once: true });
    }
    return () => {
      img.removeEventListener("load", mark);
      img.removeEventListener("error", mark);
    };
  }, [src]);

  const cls = ["img-fade", pixelated && "pixelated", className].filter(Boolean).join(" ");

  return (
    <img ref={ref} src={src} alt={alt} className={cls} {...rest} />
  );
}
