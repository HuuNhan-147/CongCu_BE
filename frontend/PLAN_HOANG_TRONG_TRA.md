# Kế Hoạch Triển Khai - Hoàng Trọng Trà

## 1. Phạm vi phụ trách

- UI Authentication:
  - `LoginPage.tsx`
  - `RegisterPage.tsx`
  - tuyến đường bảo mật
- UI Quản lý tài khoản:
  - `ChangePassword.tsx`
  - `ForgotPassword.tsx`
  - `ResetPassword.tsx`
- Quản lý người dùng phía admin:
  - `AdminUserManagement.tsx`
- Lớp dữ liệu liên quan:
  - `UserApi.ts`
  - `User.ts`

## 2. Hiện trạng hiện tại

| Hạng mục | Trạng thái |
| :--- | :--- |
| `frontend/src/api/UserApi.ts` | Đã có, đang chứa các hàm auth, profile và admin user |
| `frontend/src/types/User.ts` | Đã có, cần rà soát kiểu dữ liệu trả về từ backend |
| `frontend/src/pages/LoginPage.tsx` | Chưa có |
| `frontend/src/pages/RegisterPage.tsx` | Chưa có |
| `frontend/src/pages/ChangePassword.tsx` | Chưa có |
| `frontend/src/pages/ForgotPassword.tsx` | Chưa có |
| `frontend/src/pages/ResetPassword.tsx` | Chưa có |
| `frontend/src/admincomponents/AdminUserManagement.tsx` | Chưa có |
| `frontend/src/routes/index.tsx` | Đã import các màn nhưng source file thực tế chưa đủ |

## 3. Kế hoạch theo giai đoạn

### Giai đoạn 1: Chốt dữ liệu và API

- Rà soát `User.ts` để đồng bộ với response backend.
- Chuẩn hóa `UserApi.ts` theo nhóm chức năng:
  - Auth: login, register
  - Password: forgot, reset, change
  - Profile/User: profile, get all users, search, update, delete
- Thống nhất cách xử lý lỗi để UI hiển thị thông báo đồng nhất.

### Giai đoạn 2: Dựng UI Authentication

- Tạo `LoginPage.tsx`:
  - Form email/password
  - Validate cơ bản
  - Gọi `loginUser`
  - Lưu auth qua `AuthContext`
  - Điều hướng theo quyền user/admin nếu cần
- Tạo `RegisterPage.tsx`:
  - Form name/email/phone/password/confirm password
  - Validate đầu vào
  - Gọi `registerUser`
  - Thông báo thành công và chuyển sang login

### Giai đoạn 3: Dựng UI quản lý tài khoản

- Tạo `ForgotPassword.tsx`:
  - Nhập email
  - Gửi yêu cầu reset
  - Hiển thị thông báo gửi email thành công hoặc thất bại
- Tạo `ResetPassword.tsx`:
  - Lấy `resetToken` từ URL
  - Form nhập mật khẩu mới và xác nhận mật khẩu
  - Gọi `resetPassword`
- Tạo `ChangePassword.tsx`:
  - Kiểm tra token đăng nhập
  - Form mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu
  - Gọi `updatePassword`

### Giai đoạn 4: Tuyến đường bảo mật và quyền truy cập

- Bổ sung hoặc chỉnh logic bảo vệ route dựa trên `AuthContext`.
- Xác định route nào yêu cầu:
  - user đã đăng nhập
  - admin
- Kiểm tra điều hướng khi:
  - chưa đăng nhập vào route riêng tư
  - token hết hạn hoặc bị xóa
  - user không có quyền admin

### Giai đoạn 5: Admin User Management

- Tạo `AdminUserManagement.tsx`:
  - Hiển thị danh sách user
  - Tìm kiếm user
  - Xem thông tin cơ bản
  - Cập nhật thông tin hoặc quyền admin nếu API hỗ trợ
  - Xóa user
- Chỉ cho phép truy cập với tài khoản admin.

### Giai đoạn 6: Kiểm thử và bàn giao

- Test tay các luồng:
  - đăng ký
  - đăng nhập
  - quên mật khẩu
  - reset mật khẩu
  - đổi mật khẩu
  - truy cập route cần bảo mật
  - quản lý user phía admin
- Kiểm tra thông báo lỗi, loading, redirect sau thao tác.
- Rà soát import/router để tránh lỗi build do file thiếu.

## 4. Phụ thuộc và phối hợp

- Phối hợp với bạn `Văn Tấn Quý` để chốt format response API auth/user.
- Phối hợp với nhóm frontend để tránh xung đột ở `routes/index.tsx`, `AuthContext.tsx`, `Layout`, `AdminLayout`.
- Cần thống nhất trước khi code:
  - key lưu token/user trong localStorage
  - route redirect sau login
  - quyền truy cập admin

## 5. Definition of Done

- Tất cả file trong phạm vi được giao đã tồn tại và được import đúng.
- Các màn auth/account chạy được với backend API hiện có.
- Route bảo mật hoạt động đúng theo trạng thái đăng nhập và quyền admin.
- `AdminUserManagement.tsx` thao tác được với dữ liệu thật hoặc mock API tương thích.
- Không còn lỗi import hoặc lỗi build từ nhóm file auth/user UI.

## 6. Thứ tự ưu tiên

1. `User.ts` và `UserApi.ts`
2. `LoginPage.tsx` và `RegisterPage.tsx`
3. `ForgotPassword.tsx`, `ResetPassword.tsx`, `ChangePassword.tsx`
4. Route bảo mật
5. `AdminUserManagement.tsx`
