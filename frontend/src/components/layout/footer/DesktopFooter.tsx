import Facebook from "../../../assets/images/facebook.png";
import Twitter from "../../../assets/images/twitter.png";
import Line from "../../../assets/images/line.png";

function DesktopFooter() {
  return (
    <footer className="flex items-center justify-center py-8 bg-[#313538]">
      <div className="mr-[6.25rem]">
        <a href="/" className="px-5 font-sans text-base text-white border-r border-[#828282] hover:opacity-70">
          關於 STYLiSH
        </a>
        <a href="/" className="px-5 font-sans text-base text-white border-r border-[#828282] hover:opacity-70">
          服務條款
        </a>
        <a href="/" className="px-5 font-sans text-base text-white border-r border-[#828282] hover:opacity-70">
          隱私政策
        </a>
        <a href="/" className="px-5 font-sans text-base text-white border-r border-[#828282] hover:opacity-70">
          聯絡我們
        </a>
        <a href="/" className="px-5 font-sans text-base text-white hover:opacity-70">
          FAQ
        </a>
      </div>
      <div className="flex">
        <img src={Line} alt="line-icon" className="mr-[1.875rem] cursor-pointer hover:opacity-70" />
        <img src={Twitter} alt="twitter-icon" className="mr-[1.875rem] cursor-pointer hover:opacity-70" />
        <img src={Facebook} alt="facebook-icon" className="mr-[1.875rem] cursor-pointer hover:opacity-70" />
      </div>
      <p className="text-[#828282] text-xs font-normal">© 2023. All rights reserved.</p>
    </footer>
  );
}

export default DesktopFooter;
