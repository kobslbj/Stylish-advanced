import { useContext, useState } from "react";
import Swal from "sweetalert2";
import { CartCountContext } from "../../contexts/CartCountContext";
import CartRemove from "../../assets/images/cart-remove.png";
import CartRemoveHovered from "../../assets/images/cart-remove-hover.png";
import { ProductCart } from "../../types/productCartType";

interface CartItemProps {
  cartItem: ProductCart;
  setCartUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}
const CartItem: React.FC<CartItemProps> = ({ cartItem, setCartUpdate }) => {
  const [quantity, setQuantity] = useState(cartItem.quantity);
  const { decrementCartCount } = useContext(CartCountContext);

  const options = [...Array(cartItem.stock).keys()];
  const numberOptions = options.map((value) => (
    <option key={value + 1} value={value + 1}>
      {value + 1}
    </option>
  ));

  function QuantityChangeHandler(e: React.ChangeEvent<HTMLSelectElement>) {
    setQuantity(Number(e.target.value));
    const cartItemsData: ProductCart[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemIndex = cartItemsData.findIndex(
      (item: ProductCart) =>
        item.id === cartItem.id && item.colorCode === cartItem.colorCode && item.size === cartItem.size,
    );
    if (itemIndex !== -1) {
      cartItemsData[itemIndex].quantity = Number(e.target.value);
      localStorage.setItem("cart", JSON.stringify(cartItemsData));
      setCartUpdate(true);
    }
  }
  function deleteProductHandler() {
    Swal.fire({
      title: "確定要移除商品",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        const cartItemsData: ProductCart[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const itemIndex = cartItemsData.findIndex(
          (item: ProductCart) =>
            item.id === cartItem.id && item.colorCode === cartItem.colorCode && item.size === cartItem.size,
        );
        if (itemIndex !== -1) {
          cartItemsData.splice(itemIndex, 1);
          localStorage.setItem("cart", JSON.stringify(cartItemsData));
          decrementCartCount();
        }
        Swal.fire({
          title: "Deleted!",
          text: "商品已移除",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    });
  }

  return (
    <div className="lg:mb-[30px] lg:border-t-0 border-t border-[#3F3A3A]">
      <div className="relative items-center mt-5 lg:mt-0 lg:flex">
        <div className="flex">
          <img src={cartItem.image} alt={cartItem.name} className="max-w-[114px] aspect-w-3 aspect-h-4" />
          <div className="ml-4 min-w-[370px]">
            <p className="font-sans text-base font-normal leading-5 mb-[18px]">{cartItem.name}</p>
            <p className="font-sans text-base font-normal leading-5 mb-[22px]">{cartItem.id}</p>
            <p className="font-sans text-base font-normal leading-5 mb-2.5">顏色 | {cartItem.colorName}</p>
            <p className="font-sans text-base font-normal leading-5">尺寸 | {cartItem.size}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mx-5 mt-5 lg:hidden">
          <p>數量</p>
          <p>單價</p>
          <p>總計</p>
        </div>
        <div className="lg:min-w-[32.5rem] flex items-center justify-between lg:mr-[34px] mt-5 lg:mt-0 mb-5 lg:mb-0">
          <select
            id="quantity"
            className="w-20 py-2 px-1 border rounded-lg bg-[#F3F3F3] outline-none"
            value={quantity}
            onChange={QuantityChangeHandler}
          >
            {numberOptions}
          </select>
          <p>TWD.{cartItem.price}</p>
          <p>TWD.{cartItem.price * quantity}</p>
        </div>
        <button type="button" className="absolute top-0 right-0 lg:relative group" onClick={deleteProductHandler}>
          <img src={CartRemove} alt="Remove" className="cursor-pointer group-hover:hidden" />
          <img src={CartRemoveHovered} alt="Remove" className="hidden cursor-pointer group-hover:block" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
