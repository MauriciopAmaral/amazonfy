import { useState } from "react";

const initials = (text = "") =>
  text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "♪";

/**
 * Imagem com plano B: se o link estiver vazio ou quebrado, mostra as iniciais
 * sobre um gradiente nas cores da marca.
 */
const Cover = ({ src, alt, label, shape = "square", className = "", ...rest }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;

  return (
    <div className={`cover cover--${shape} ${className}`} {...rest}>
      {showImage ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />
      ) : (
        <span className="cover__fallback" role="img" aria-label={alt}>
          {initials(label || alt)}
        </span>
      )}
    </div>
  );
};

export default Cover;
