export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderCode: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: string | boolean;
  paymentStatus: "paid" | "unpaid" | string;
  paymentMethod?: "cod" | "vnpay" | "banking" | string;
  createdAt: string;
  updatedAt?: string;
}