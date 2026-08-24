import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

const ImageCell = ({
  src,
  fallback,
  alt = "image",
  width = 60,
  height = 40,
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(!src);
    setTriedFallback(false);
  }, [src]);

  const handleError = () => {
    if (!triedFallback && fallback && fallback !== currentSrc) {
      setTriedFallback(true);
      setCurrentSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentSrc) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center rounded border border-border/50 bg-muted/40 text-muted-foreground/50 shrink-0 ${className}`}
        title={alt}
      >
        <ImageIcon className="w-4 h-4" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      style={{ width, height }}
      onError={handleError}
      className={`object-cover rounded border border-border shrink-0 block ${className}`}
    />
  );
};

export default ImageCell;
