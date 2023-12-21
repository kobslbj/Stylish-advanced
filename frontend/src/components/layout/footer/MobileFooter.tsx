import Cookies from "js-cookie";
import Facebook from "../../../assets/images/facebook.png";
import Twitter from "../../../assets/images/twitter.png";
import Line from "../../../assets/images/line.png";
import Cart from "../Cart";
import Member from "../../../assets/images/member-mobile.png";

function MobileFooter() {
  return (
    <footer className="flex flex-col items-center justify-center bg-[#313538]">
      <div className="flex items-center mb-3.5 mt-6">
        <div className="flex">
          <div className="mr-9">
            <a href="/" className="block font-sans text-base text-white hover:opacity-70">
              關於 STYLiSH
            </a>
            <a href="/" className="block font-sans text-base text-white hover:opacity-70">
              服務條款
            </a>
            <a href="/" className="block font-sans text-base text-white hover:opacity-70">
              隱私政策
            </a>
          </div>
          <div className="mr-[1.875rem]">
            <a href="/" className="block font-sans text-base text-white hover:opacity-70">
              聯絡我們
            </a>
            <a href="/" className="block font-sans text-base text-white hover:opacity-70">
              FAQ
            </a>
          </div>
        </div>
        <div className="flex">
          <img
            src={Line}
            alt="line-icon"
            className="mr-[1.875rem] cursor-pointer hover:opacity-70"
            width={20}
            height={20}
          />
          <img
            src={Twitter}
            alt="twitter-icon"
            className="mr-[1.875rem] cursor-pointer hover:opacity-70"
            width={20}
            height={20}
          />
          <img
            src={Facebook}
            alt="facebook-icon"
            className="mr-[1.875rem] cursor-pointer hover:opacity-70"
            width={20}
            height={20}
          />
        </div>
      </div>
      <p className="text-[#828282] text-xs font-normal mb-5">© 2023. All rights reserved.</p>
      <div className="flex w-full my-2">
        <a href="/checkout" className="flex items-center justify-center w-1/2 border-r border-[#828282]">
          <Cart />
          <span className="font-sans text-base font-normal text-white">購物車</span>
        </a>
        <a href={Cookies.get("token") ? "/user" : "/login"} className="flex items-center justify-center w-1/2">
          <img src={Member} alt="member" />
          <span className="font-sans text-base font-normal text-white">會員</span>
        </a>
      </div>
    </footer>
  );
}

export default MobileFooter;
