import { useState } from "react";
import CommentForm from "./CommentForm";
import { OrderItemType } from "../../types/orderType";

interface OrderItemProps {
  data:OrderItemType
}

const OrderItem:React.FC<OrderItemProps> = ({ data }) => {
  const [addComment, setAddComment] = useState(false);
  return (
    <tr>
      <td className="flex px-6 py-4">
        <a href={`/products/${data.id}`}><img src={data.image} alt={data.name} className="max-w-[114px] aspect-w-3 aspect-h-4" /></a>
        <div className="ml-4 min-w-[200px]">
          <p className="font-sans text-base font-normal leading-5 mb-[18px]"><a href={`/products/${data.id}`} className="hover:text-brown">{data.name}</a></p>
          <p className="font-sans text-base font-normal leading-5 mb-[22px]">{data.id}</p>
          <p className="font-sans text-base font-normal leading-5 mb-2.5">顏色 | {data.color_name}</p>
          <p className="font-sans text-base font-normal leading-5">尺寸 | {data.size}</p>
        </div>
      </td>
      <td className="px-6 py-4">{data.qty}</td>
      <td className="px-6 py-4">TWD.{data.price}</td>
      <td className="px-6 py-4">TWD.{data.price * data.qty}</td>
      <td className="px-6 py-4">
        <button type="button" className="text-brown" onClick={() => setAddComment(true)}>
          為商品撰寫評論
        </button>
      </td>
      {addComment && <CommentForm setAddComment={setAddComment} productId={data.id} />}
    </tr>
  );
};

export default OrderItem;
