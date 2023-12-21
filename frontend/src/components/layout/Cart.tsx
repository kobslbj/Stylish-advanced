import { useContext } from "react";
import CartIcon from "../../assets/images/cart.png";
import HoveredCartIcon from "../../assets/images/cart-hover.png";
import MobileCartIcon from "../../assets/images/cart-mobile.png";
import { CartCountContext } from "../../contexts/CartCountContext";

const Cart = () => {
  const { count } = useContext(CartCountContext);
  return (
    <div className="relative group">
      <img src={CartIcon} alt="cart" className="hidden lg:group-hover:hidden lg:block" />
      <img src={HoveredCartIcon} alt="cart-hover" className="hidden lg:group-hover:block" />
      <img src={MobileCartIcon} alt="cart" className="lg:hidden" />
      <div
        className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white rounded-full bg-brown"
      >
        {count}
      </div>
    </div>
  );
};

export default Cart;
