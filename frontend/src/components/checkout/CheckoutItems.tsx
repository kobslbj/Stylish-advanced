import { useState, useEffect, useContext } from "react";
import { ProductCart } from "../../types/productCartType";
import CartItem from "./CartItem";
import { CartCountContext } from "../../contexts/CartCountContext";

interface CheckoutItmesProps {
  setCartUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

const CheckoutItems: React.FC<CheckoutItmesProps> = ({ setCartUpdate }) => {
  const [cartData, setCartData] = useState<ProductCart[]>([]);
  const { count } = useContext(CartCountContext);
  useEffect(() => {
    const handleStorageChange = () => {
      const cartItems: ProductCart[] = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartData(cartItems);
    };
    handleStorageChange();
  }, [count]);

  const cartItems = cartData.map((cartItem: ProductCart) => (
    <CartItem
      key={cartItem.id + cartItem.colorCode + cartItem.size}
      cartItem={cartItem}
      setCartUpdate={setCartUpdate}
    />
  ));

  return (
    <div>
      <div className="flex mb-4">
        <span className="lg:mr-[490px] font-sans font-bold text-base color-[#3F3A3A]">購物車</span>
        <div className="lg:min-w-[32.5rem] hidden lg:block">
          <span className="font-sans text-base color-[#3F3A3A] mr-48">數量</span>
          <span className="font-sans text-base color-[#3F3A3A] mr-48">單價</span>
          <span className="font-sans text-base color-[#3F3A3A]">小計</span>
        </div>
      </div>
      <div className="lg:border border-[#979797] lg:pt-10 pb-[10px] lg:px-[30px]">
        {cartData.length > 0 ? cartItems : <p className="pb-10 text-center">目前沒有任何商品</p>}
      </div>
    </div>
  );
};

export default CheckoutItems;
