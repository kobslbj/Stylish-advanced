import React from "react";
import { useQuery } from "@tanstack/react-query";
import Close from "../../assets/images/close.png";
import Modal from "../layout/Modal";
import { getComparePrice } from "../../utils/api";

interface ComparePriceType {
  shopPic: string
  shopName: string
  price: string
  imageUrl: string
}

interface CompareProductProps {
  setShowCompare: React.Dispatch<React.SetStateAction<boolean>>;
  productName: string;
}

const ComparePrice:React.FC<CompareProductProps> = ({ setShowCompare, productName }) => {
  const { data } = useQuery({
    queryFn: () => getComparePrice(productName),
    queryKey: ["comparePrice", productName],
  });
  let comparePriceItems;
  console.log(data);
  if (data) {
    comparePriceItems = data.map((item:ComparePriceType) => (
      <div key={item.shopName} className="flex items-center gap-4 my-2">
        <img src={item.shopPic} alt={item.shopName} className="object-cover w-12 h-12" />
        <p>TWD.{item.price}</p>
        <img src={item.imageUrl} alt={productName} className="object-cover w-12 h-12" />
      </div>
    ));
  }
  return (
    <Modal>
      <button type="button" onClick={() => setShowCompare(false)}><img src={Close} alt="close-button" className="absolute top-3 right-3" />
      </button>
      <div className="flex flex-col items-center min-h-[400px] min-w-[300px]">
        <p className="text-xl">{productName}</p>
        <p className="text-xl">比價結果</p>
        {data && data.length === 0 && <p className="py-7">查無比價資料</p>}
        <div>{comparePriceItems}</div>
      </div>
    </Modal>
  );
};
export default ComparePrice;
