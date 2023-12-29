export interface Order {
  number: string
  status: number
  time: string
  total: number
  recipient_time: string
  list: OrderItemType[]
}

export interface OrderItemType {
  id: string
  name: string
  image: string
  price: number
  color_name: string
  size: string
  qty: number
}
