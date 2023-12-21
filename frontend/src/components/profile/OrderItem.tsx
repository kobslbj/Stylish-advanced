import { OrderItemType } from "../../types/orderType";

interface OrderItemProps {
  item: OrderItemType;
}

const OrderItem: React.FC<OrderItemProps> = ({ item }) => (
  <div className="border-t border-[#3F3A3A] items-center justify-between lg:flex px-3">
    <div className="flex items-center my-5">
      <a href={`products/${item.product_id}`} className="mr-3 font-sans text-base font-normal leading-5 text-brown">
        {item.name}
      </a>
      <p className="mr-3 font-sans text-base font-normal leading-5">{item.product_id}</p>
      <p className="mr-3 font-sans text-base font-normal leading-5">顏色 | {item.color_name}</p>
      <p className="mr-3 font-sans text-base font-normal leading-5">尺寸 | {item.size}</p>
    </div>
    <div className="flex items-center justify-between lg:mt-0 lg:mb-0">
      <p className="mr-2 font-sans text-base font-normal leading-5">數量: {item.qty}</p>
      <p className="mr-2 font-sans text-base font-normal leading-5">單價: TWD.{item.price}</p>
      <p className="mr-2 font-sans text-base font-normal leading-5">總計: TWD.{item.price * item.qty}</p>
    </div>
  </div>
);

export default OrderItem;
