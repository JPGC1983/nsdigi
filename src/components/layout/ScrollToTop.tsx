import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Ao trocar de página, volta ao topo (exceto quando o endereço aponta para uma âncora). */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
