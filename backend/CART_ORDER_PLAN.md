# Cart & Order API + VNPay Integration Plan

## Overview
Implementation plan for Shopping Cart, Order Management, and VNPay Payment Gateway Integration.

---

## Phase 1: Database Schema Design

### 1.1 Cart Schema
```javascript
Cart {
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number,
    variant: Object (optional)
  }],
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 1.2 Order Schema
```javascript
Order {
  userId: ObjectId (ref: User),
  orderNumber: String (unique),
  items: [{
    productId: ObjectId,
    productName: String,
    quantity: Number,
    price: Number,
    variant: Object
  }],
  subtotal: Number,
  shippingFee: Number,
  discount: Number,
  totalAmount: Number,
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String (pending, paid, failed, refunded),
  orderStatus: String (pending, confirmed, shipping, delivered, cancelled),
  vnpayTransactionId: String,
  vnpayResponseCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Phase 2: Cart API Implementation

### 2.1 Routes (`routes/cart.js`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:itemId` | Update cart item quantity |
| DELETE | `/api/cart/items/:itemId` | Remove item from cart |
| DELETE | `/api/cart` | Clear entire cart |

### 2.2 Controller (`controller/CartController.js`)
- [ ] `getCart` - Retrieve cart with validation
- [ ] `addToCart` - Add/update item in cart
- [ ] `updateCartItem` - Update quantity
- [ ] `removeCartItem` - Remove specific item
- [ ] `clearCart` - Empty cart

### 2.3 Middleware
- [ ] Cart validation middleware
- [ ] Stock availability check

---

## Phase 3: Order API Implementation

### 3.1 Routes (`routes/order.js`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all user orders |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/admin/orders` | Get all orders (admin) |
| PUT | `/api/admin/orders/:id/status` | Update order status (admin) |

### 3.2 Controller (`controller/OrderController.js`)
- [ ] `createOrder` - Create order from cart
- [ ] `getOrders` - List user's orders
- [ ] `getOrderById` - Get order details
- [ ] `cancelOrder` - Cancel pending order
- [ ] `updateOrderStatus` - Admin update status
- [ ] `getAllOrders` - Admin get all orders

---

## Phase 4: VNPay Integration

### 4.1 Configuration (`config/vnpay.js`)
```javascript
{
  tmnCode: process.env.VNPAY_TMN_CODE,
  secureSecret: process.env.VNPAY_SECURE_SECRET,
  vnpUrl: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL,
  apiUrl: process.env.VNPAY_API_URL // for query transaction
}
```

### 4.2 VNPay Service (`services/vnpayService.js`)
- [ ] `createPaymentUrl` - Generate VNPay payment URL
- [ ] `verifyIpn` - Verify IPN callback from VNPay
- [ ] `queryTransaction` - Query transaction status

### 4.3 Payment Routes (`routes/payment.js`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/vnpay/create` | Create VNPay payment URL |
| GET | `/api/payment/vnpay/callback` | VNPay IPN callback |
| GET | `/api/payment/vnpay/return` | User return URL |

### 4.4 Payment Flow
```
1. User creates order → Order status: pending
2. Call /api/payment/vnpay/create → Get VNPay URL
3. Redirect user to VNPay
4. User completes payment on VNPay
5. VNPay redirects to /api/payment/vnpay/return
6. VNPay sends IPN to /api/payment/vnpay/callback
7. Verify IPN → Update order payment status
8. Show result to user
```

---

## Phase 5: Files to Create

### Directory Structure
```
backend/
├── models/
│   ├── CartModel.js
│   └── OrderModel.js
├── controller/
│   ├── CartController.js
│   ├── OrderController.js
│   └── PaymentController.js
├── services/
│   └── vnpayService.js
├── routes/
│   ├── cart.js
│   ├── order.js
│   └── payment.js
├── middleware/
│   └── cartValidation.js
├── config/
│   └── vnpay.js
└── utils/
    └── orderNumberGenerator.js
```

---

## Phase 6: Environment Variables

Add to `.env`:
```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECURE_SECRET=your_secure_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/payment/vnpay/return
VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction

# Application
BASE_URL=http://localhost:3000
```

---

## Phase 7: Testing Checklist

### Cart API
- [ ] Add item to empty cart
- [ ] Add existing item (update quantity)
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear cart
- [ ] Cart total calculation

### Order API
- [ ] Create order from cart
- [ ] Create order with invalid data
- [ ] Get order details
- [ ] Cancel order
- [ ] Order number uniqueness

### VNPay Integration
- [ ] Create payment URL
- [ ] Payment success flow
- [ ] Payment cancel flow
- [ ] IPN verification
- [ ] Transaction query
- [ ] Handle duplicate callbacks

---

## Phase 8: Security Considerations

- [ ] JWT authentication for all cart/order endpoints
- [ ] Validate user ownership (users can only access their own cart/orders)
- [ ] VNPay secure hash verification (HMAC-SHA512)
- [ ] Idempotency for IPN callbacks
- [ ] Input validation and sanitization
- [ ] Rate limiting for payment endpoints

---

## Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Database Schema | 1 hour |
| Phase 2 | Cart API | 3 hours |
| Phase 3 | Order API | 4 hours |
| Phase 4 | VNPay Integration | 4 hours |
| Phase 5 | Testing & Debug | 3 hours |
| **Total** | | **~15 hours** |

---

## Dependencies

Check if needed:
- [ ] `crypto` (built-in) - For VNPay secure hash
- [ ] `axios` or `node-fetch` - For VNPay API calls
- [ ] `joi` or `express-validator` - For validation

---

## Notes

1. **VNPay Sandbox**: Use sandbox environment for testing
2. **Order Number Format**: `ORD-YYYYMMDD-XXXXX` (date + random)
3. **Cart Persistence**: Consider cart expiry (e.g., 30 days)
4. **Stock Management**: Deduct stock on order creation, restore on cancel
5. **Error Handling**: Comprehensive error messages for payment failures
