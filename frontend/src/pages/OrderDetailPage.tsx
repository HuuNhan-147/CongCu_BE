import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrderDetails } from "../api/OrderApi";
import { Order } from "../types/order";
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id, user]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const data = await getOrderDetails(token, orderId);
      setOrder(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      toast.error("Không thể lấy thông tin đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (order: Order) => {
    const isPaid = order.paymentStatus === "paid";
    const isDelivered = order.isDelivered === "delivered";

    if (isPaid && isDelivered) {
      return { text: "Hoàn thành", className: "bg-green-100 text-green-800" };
    }
    if (isPaid) {
      return { text: "Đã thanh toán", className: "bg-blue-100 text-blue-800" };
    }
    if (isDelivered) {
      return { text: "Đã giao", className: "bg-purple-100 text-purple-800" };
    }
    return { text: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" };
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "vnpay":
        return "Thanh toán qua VNPay";
      case "banking":
        return "Chuyển khoản ngân hàng";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  const status = getStatusBadge(order);
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = order.totalPrice - subtotal;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Chi tiết đơn hàng
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="font-mono font-bold text-lg">{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.className}`}>
                {status.text}
              </span>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
              <FaBox className="text-gray-400" />
              Sản phẩm ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image || "/images/no-image.png"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {item.price.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : (
                    `${shippingFee.toLocaleString("vi-VN")}đ`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Tổng cộng</span>
                <span className="text-red-600">
                  {order.totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
              <FaMapMarkerAlt className="text-gray-400" />
              Địa chỉ giao hàng
            </h2>

            <div className="space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-gray-600">
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </p>
              {order.shippingAddress.note && (
                <p className="text-sm text-gray-500 italic">
                  Ghi chú: {order.shippingAddress.note}
                </p>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
              <FaClock className="text-gray-400" />
              Thông tin đơn hàng
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Ngày đặt</p>
                <p className="font-medium">
                  {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                <p className={`font-medium ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
