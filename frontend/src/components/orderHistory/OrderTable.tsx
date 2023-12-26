import React, { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import OrderItem from "./OrderItem";

// fake data
const orders = [
  {
    number: 1124327251989,
    status: 0,
    time: "2023-12-25 10:26:24",
    total: 1299,
    recipient_time: "不指定",
    list: [
      {
        id: "201807202157",
        name: "活力花紋長筒牛仔褲",
        price: 1299,
        image: "http://localhost:3000/assets/201807202157/main.jpg",
        color_name: "藍色",
        size: "M",
        qty: 1,
      },
    ],
  },
  {
    number: 1124327251990,
    status: 0,
    time: "2023-12-25 10:26:24",
    total: 1299,
    recipient_time: "不指定",
    list: [
      {
        id: "201807202157",
        name: "活力花紋長筒牛仔褲",
        image: "http://localhost:3000/assets/201807202157/main.jpg",
        price: 1299,
        color_name: "藍色",
        size: "M",
        qty: 2,
      },
      {
        id: "201807202157",
        name: "活力花紋長筒牛仔褲",
        image: "http://localhost:3000/assets/201807202157/main.jpg",
        price: 1299,
        color_name: "藍色",
        size: "M",
        qty: 2,
      },
    ],
  },
];
const OrderTable = () => {
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  const toggleOrderDetails = (orderNumber: number) => {
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
        {orders.map((order) => (
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
