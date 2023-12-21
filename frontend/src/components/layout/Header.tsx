import useCheckResponsive from "../../hooks/useCheckResponsive";
import MobileHeader from "./header/MobileHeader";
import DesktopHeader from "./header/DesktopHeader";

const Header = () => {
  const isMobile = useCheckResponsive();

  return isMobile ? <MobileHeader /> : <DesktopHeader />;
};

export default Header;
