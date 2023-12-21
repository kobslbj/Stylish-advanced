import { useState } from "react";
import Logo from "../../../assets/images/logo.png";
import Search from "../../../assets/images/search.png";
import SearchBar from "./SearchBar";

function MobileHeader() {
  const [searching, setSearching] = useState(false);
  return (
    <header className="fixed top-0 z-10 items-center w-full">
      <div className="flex items-center bg-white py-3.5">
        <a href="/" className="mx-auto">
          <img src={Logo} alt="logo" width={129} height={24} />
        </a>
        <button
          type="button"
          onClick={() => {
            setSearching(!searching);
          }}
          className="fixed right-0 top-1"
        >
          <img src={Search} alt="search-icon" width={40} height={40} />
        </button>
      </div>
      {searching && (
        <div className="px-2.5 bg-white py-1.5">
          <SearchBar />
        </div>
      )}
      <nav className="flex w-full bg-[#313538] py-3">
        <a
          href="/women"
          className="w-1/3 text-xl font-sans text-center text-[#828282] font-normal border-r-2 border-[#3F3A3A] hover:text-brown "
        >
          女裝
        </a>
        <a
          href="/men"
          className="w-1/3 text-xl font-sans text-center text-[#828282] font-normal border-r-2 border-[#3F3A3A] hover:text-brown "
        >
          男裝
        </a>
        <a
          href="/accessories"
          className="w-1/3 font-sans text-center text-xl text-[#828282] font-normal hover:text-brown"
        >
          配件
        </a>
      </nav>
    </header>
  );
}

export default MobileHeader;
