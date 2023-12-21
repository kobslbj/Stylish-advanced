import useCheckResponsive from "../../hooks/useCheckResponsive";
import MobileFooter from "./footer/MobileFooter";
import DesktopFooter from "./footer/DesktopFooter";

const Footer = () => {
  const isMobile = useCheckResponsive();

  return isMobile ? <MobileFooter /> : <DesktopFooter />;
};

export default Footer;
