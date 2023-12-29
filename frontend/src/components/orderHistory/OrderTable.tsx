import React, { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { fetchOrderHistory } from "../../utils/api";
import OrderItem from "./OrderItem";
import { Order } from "../../types/orderType";

const OrderTable = () => {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const userId = Cookies.get("user_id");
  const { data, isLoading, isError } = useQuery({
    queryFn: () => fetchOrderHistory(userId!),
    queryKey: ["orders", userId],
  });
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="py-40 text-center lg:py-[4rem]">500 Internal Server Error</p>;

  const toggleOrderDetails = (orderNumber: string) => {
    setExpandedOrders((prevExpandedOrders) => {
      if (prevExpandedOrders.includes(orderNumber)) {
        return prevExpandedOrders.filter((number) => number !== orderNumber);
      }
      return [...prevExpandedOrders, orderNumber];
    });
  };

  return (
    <table className="min-w-[900px] border-t border-black table-auto">
      <thead>
        <tr className="text-lg font-bold border-b">
          <th scope="col" className="px-6 py-3">訂單編號</th>
          <th scope="col" className="px-6 py-3">訂單時間</th>
          <th scope="col" className="px-6 py-3">總金額</th>
          <th scope="col" className="px-6 py-3">收件時間</th>
          <th scope="col" className="px-6 py-3">狀態</th>
          <th scope="col" className="px-6 py-3">商品細項</th>
        </tr>
      </thead>
      <tbody className="py-6">
        {data.map((order:Order) => (
          <React.Fragment key={order.number}>
            <tr className="border-b">
              <td className="px-6 py-4">{order.number}</td>
              <td className="px-6 py-4">{order.time}</td>
              <td className="px-6 py-4">TWD.{order.total}</td>
              <td className="px-6 py-4">{order.recipient_time}</td>
              <td className="px-6 py-4">{order.status === 0 ? "寄送中" : "已送達"}</td>
              <td className="px-6 py-4">
                <button type="button" onClick={() => toggleOrderDetails(order.number)}>
                  {expandedOrders.includes(order.number) ? (
                    <div className="flex items-center gap-2 min-w-[134px] justify-center">
                      <span className="text-brown ">收起</span>
                      <FaAngleUp color="#8B572A" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-brown">查看商品紀錄</span>
                      <FaAngleDown color="#8B572A" />
                    </div>
                  )}
                </button>
              </td>
            </tr>
            {expandedOrders.includes(order.number) && (
            <tr>
              <td colSpan={6}>
                <thead>
                  <tr className="text-lg font-bold border-b">
                    <th scope="col" className="px-6 py-3">商品名稱</th>
                    <th scope="col" className="px-6 py-3">數量</th>
                    <th scope="col" className="px-6 py-3">單價</th>
                    <th scope="col" className="px-6 py-3">小計</th>
                    <th scope="col" className="px-6 py-3">評論</th>
                  </tr>
                </thead>
                <tbody>
                  {order.list.map((item) => (
                    <React.Fragment key={item.id}>
                      <OrderItem data={item} />
                    </React.Fragment>
                  ))}
                </tbody>
              </td>
            </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
