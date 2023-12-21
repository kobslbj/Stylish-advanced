import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { fetchOrderHistory } from "../../utils/api";
import OrderItem from "./OrderItem";
import formatDate from "../../utils/formatDate";
import { OrderDetails } from "../../types/orderType";

const OrderHistory = () => {
  const userId = Cookies.get("user_id");
  const { data, isLoading, isError } = useQuery({
    queryFn: () => fetchOrderHistory(userId!),
    queryKey: ["orderHistory", userId],
  });
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="py-40 text-center lg:py-[4rem]">500 Internal Server Error</p>;

  const orderHistoryItems = data.map((order: OrderDetails) => (
    <div key={order.order_id} className="my-4">
      <div className="items-center justify-between lg:flex">
        <p className="mt-3 mr-4 font-sans text-base font-normal leading-5">訂單 ID: {order.order_id}</p>
        <p className="mt-3 mr-4 font-sans text-base font-normal leading-5">訂單日期: {formatDate(order.created_at)}</p>
        <p className="mt-3 mr-4 font-sans text-base font-normal leading-5">Total: TWD.{order.total}</p>
        <p className="mt-3 mr-4 font-sans text-base font-normal leading-5">郵寄時間: {order.delivery_time}</p>
      </div>
      <p className="font-sans text-[#3F3A3A] text-base font-bold my-4">商品細項</p>
      <div className="border-b border-black border-x">
        {order.items.map((item) => (
          <OrderItem key={item.item_id} item={item} />
        ))}
      </div>
    </div>
  ));
  return (
    <div>
      <p className="font-sans text-[#3F3A3A] text-xl font-bold mb-4">訂單紀錄</p>
      <div className="px-6 py-4 border border-black">{orderHistoryItems}</div>
    </div>
  );
};

export default OrderHistory;
