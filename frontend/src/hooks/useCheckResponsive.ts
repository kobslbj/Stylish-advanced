import { useState, useEffect } from "react";

const useCheckResponsive = (MinTabletWidth = 1280) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MinTabletWidth);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MinTabletWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [MinTabletWidth]);

  return isMobile;
};

export default useCheckResponsive;
