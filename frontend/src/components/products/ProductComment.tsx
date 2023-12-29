import { useState } from "react";
import Star from "../../assets/images/star.png";
import RedHeart from "../../assets/images/redheart.png";
import Heart from "../../assets/images/heart.png";

const ProductComment = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLikedNumber, setIsLikedNumber] = useState(1);
  const toggleLiked = () => {
    setIsLiked(!isLiked);
    setIsLikedNumber(isLiked ? isLikedNumber - 1 : isLikedNumber + 1);
  };
  return (
    <>
      <div className=" min-h-[12.3125rem] flex-shrink-0 rounded-xl border border-gray-200 bg-white p-[1.6rem] relative">
        <div className="flex flex-row">
          <div className="w-[5rem] h-[5rem] flex-shrink-0 rounded-[4.74738rem] border "></div>
          <div className="flex flex-col ml-3 mt-[0.69rem]">
            <p className="font-bold">Justin</p>
            <p className="text-[#909090;]">2023-11-21 | 顏色: 藍色</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 mr-8 mt-8 flex flex-row gap-3">
          <p>{isLikedNumber}</p>
          <img
            className="cursor-pointer"
            src={isLiked ? RedHeart : Heart}
            width={25}
            height={25}
            alt="Heart"
            onClick={toggleLiked}
          />
        </div>
        <div className="flex flex-row mt-1">
          <img src={Star} alt="star" />
          <img src={Star} alt="star" />
          <img src={Star} alt="star" />
          <img src={Star} alt="star" />
          <img src={Star} alt="star" />
        </div>
        <p className="font-bold mt-2">
          我們要學會站在別人的角度思考。歐陽修相信，古人相馬不相皮，瘦嗎雖瘦骨法奇;
          世無伯樂良可嗤，千金市馬惟市肥。這段話令我陷入了沈思。面對如此難題，我們必須設想周全。
        </p>
      </div>
    </>
  );
};

export default ProductComment;
