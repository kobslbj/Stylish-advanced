export interface OrderItemType {
  qty: number;
  name: string;
  size: string;
  price: number;
  item_id: number;
  color_code: string;
  color_name: string;
  product_id: number;
}
export interface OrderDetails {
  order_id: number;
  user_id: number;
  shipping_method: string;
  payment_method: string;
  subtotal: string;
  freight: string;
  total: number;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  recipient_address: string;
  delivery_time: string;
  created_at: string;
  items: OrderItemType[];
}
