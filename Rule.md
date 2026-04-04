# Rule.md

## 1. Tổng quan

Tài liệu này mô tả các quy tắc cơ bản cho hệ thống API gồm:

* Xác thực (Authentication)
* Quản lý người dùng (User Management)

Chỉ tập trung vào các chức năng đơn giản, không đi sâu chi tiết.

---

## 2. API Authentication

### 2.1 Register

* Người dùng có thể đăng ký tài khoản mới.
* Yêu cầu các thông tin cơ bản:

  * Email
  * Mật khẩu
* Kiểm tra:

  * Email không được trùng
  * Mật khẩu phải hợp lệ (độ dài tối thiểu)

### 2.2 Login

* Người dùng đăng nhập bằng:

  * Email
  * Mật khẩu
* Nếu thông tin đúng:

  * Trả về token (JWT hoặc tương tự)
* Nếu sai:

  * Trả về lỗi xác thực

---

## 3. API Quản lý Người dùng

### 3.1 Profile

* Người dùng có thể xem thông tin cá nhân:

  * Email
  * Thông tin cơ bản khác (nếu có)
* Yêu cầu:

  * Phải đăng nhập (có token hợp lệ)

### 3.2 Change Password

* Người dùng có thể đổi mật khẩu
* Yêu cầu:

  * Nhập mật khẩu cũ
  * Nhập mật khẩu mới
* Kiểm tra:

  * Mật khẩu cũ phải đúng
  * Mật khẩu mới hợp lệ

---

## 4. Quy tắc chung

* Tất cả API (trừ login, register) cần xác thực bằng token
* Dữ liệu trả về ở dạng JSON
* Xử lý lỗi rõ ràng, dễ hiểu
* Không lưu mật khẩu dạng plain text (phải mã hóa)

---

## 5. Ghi chú

* Thiết kế đơn giản, dễ mở rộng
* Có thể bổ sung thêm chức năng sau (update profile, logout, etc.)
