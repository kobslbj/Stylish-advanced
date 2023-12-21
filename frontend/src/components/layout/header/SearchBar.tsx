import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../../../assets/images/search.png";
import HoveredSearch from "../../../assets/images/search-hover.png";

const SearchBar: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const productSearchHandler = () => {
    navigate(`/?search=${searchInputRef?.current?.value}`);
  };
  return (
    <form onSubmit={productSearchHandler}>
      <label htmlFor="searchInput" className="relative">
        <input
          ref={searchInputRef}
          className=" rounded-[1.25rem] border border-[#979797] py-2.5 pl-3 text-[#8B572A] text-xl font-sans font-normal focus:outline-none lg:max-w-[13.375rem] w-full"
          placeholder="搜尋"
          type="text"
          name="search"
          required
        />
        <button type="submit" className="absolute cursor-pointer group right-1" >
          <img src={Search} alt="search-icon" className="group-hover:hidden" />
          <img src={HoveredSearch} alt="hover-search-icon" className="hidden group-hover:block" />
        </button>
      </label>
    </form>
  );
};

export default SearchBar;
