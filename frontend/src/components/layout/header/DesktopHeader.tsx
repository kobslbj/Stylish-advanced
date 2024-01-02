import Cookies from "js-cookie";
import Logo from "../../../assets/images/logo.png";
import SearchBar from "./SearchBar";
import Cart from "../Cart";
import Member from "../../../assets/images/member.png";
import HoveredMember from "../../../assets/images/member-hover.png";

const DesktopHeader: React.FC = () => (
  <header className="fixed top-0 w-full z-10 bg-white flex justify-between py-[1.625rem] border-b-[40px] border-[#313538] mb-[8.875rem]">
    <div className="flex items-end ml-[3.75rem]">
      <a href="/">
        <img src={Logo} alt="logo" width={258} height={48} />
      </a>
      <div className="flex items-center ml:6 xl:ml-[3.5rem]">
        <a href="/women" className="px-14 text-xl font-sans font-normal border-r-2 border-[#3F3A3A] hover:text-brown">
          女裝
        </a>
        <a href="/men" className="px-14 text-xl font-sans font-normal border-r-2 border-[#3F3A3A] hover:text-brown">
          男裝
        </a>
        <a href="/accessories" className="px-14 text-xl font-sans font-normal border-r-2 border-[#3F3A3A] hover:text-brown">
          配件
        </a>
        <a href="/flashsale" className="font-sans text-xl font-normal px-14 hover:text-brown">
          限時限量搶購
        </a>
      </div>
    </div>
    <div className="flex items-center mr-[3.375rem]">
      <SearchBar />
      <a href="/checkout" className="mx-[2.625rem]">
        <Cart />
      </a>
      <a href={Cookies.get("token") ? "/my/profile" : "/login"} className="cursor-pointer group">
        <img src={Member} alt="member" className="group-hover:hidden" />
        <img src={HoveredMember} alt="member-hover" className="hidden group-hover:block" />
      </a>
    </div>
  </header>
);

export default DesktopHeader;
