# 234876_NgoMinhNhat — Quản lý thư viện sách trên nền tảng đám mây

Ứng dụng React + Express + MongoDB quản lý sách; mã nguồn chia thành `backend/` và `frontend/`.

Repository: https://github.com/s234876-ai/234876_NgoMinhNhat

## Chức năng

- Tạo, xem danh sách, xem chi tiết, cập nhật và xóa sách.
- Tìm kiếm không phân biệt hoa thường theo tên sách, tác giả, thể loại, nhà xuất bản và ISBN.
- Kiểm tra dữ liệu bắt buộc, số lượng, năm xuất bản và ISBN duy nhất.
- Giao diện React có trạng thái tải, lỗi, danh sách rỗng, biểu mẫu thêm/sửa và xác nhận xóa.
- `/health` hiển thị trạng thái API và kết nối cơ sở dữ liệu.
- Docker Compose chạy toàn bộ ứng dụng cục bộ; có Dockerfile riêng cho backend và frontend.

## Cấu trúc dữ liệu

MongoDB database: `234876_NgoMinhNhat` · collection: `books`.

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `title` | chuỗi | bắt buộc |
| `author` | chuỗi | bắt buộc |
| `category` | chuỗi | bắt buộc |
| `publisher` | chuỗi | bắt buộc |
| `publishYear` | số | bắt buộc, không âm |
| `isbn` | chuỗi | bắt buộc, duy nhất |
| `quantity` | số nguyên | bắt buộc, không âm |
| `description` | chuỗi | tùy chọn |

## API

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/books` | Lấy danh sách |
| `GET` | `/api/books/:id` | Xem chi tiết |
| `POST` | `/api/books` | Thêm sách |
| `PUT` | `/api/books/:id` | Cập nhật sách |
| `DELETE` | `/api/books/:id` | Xóa sách |
| `GET` | `/api/books?search=cloud` | Tìm theo tên, tác giả, thể loại, nhà xuất bản hoặc ISBN |
| `GET` | `/health` | Kiểm tra dịch vụ |

Ví dụ payload:

```json
{
  "title": "Nhà giả kim",
  "author": "Paulo Coelho",
  "category": "Tiểu thuyết",
  "publisher": "NXB Văn học",
  "publishYear": 2020,
  "isbn": "9786043074546",
  "quantity": 5,
  "description": "Hành trình theo đuổi ước mơ."
}
```

## Chạy cục bộ với Docker

Cài Docker Desktop, sau đó chạy tại thư mục này:

```powershell
docker compose up --build
```

Compose chờ MongoDB và API healthy trước khi khởi chạy dịch vụ phụ thuộc. Kiểm tra trạng thái tại `/health`; trạng thái container có thể xem bằng `docker compose ps`.

Mở giao diện tại `http://localhost:8080`, API tại `http://localhost:5000` và trạng thái tại `http://localhost:5000/health`. Compose tạo MongoDB cục bộ để chạy thử không cần thông tin Atlas. Dữ liệu được lưu trong volume `mongo-data`.

Để kết nối Atlas, tạo database user và cấu hình IP access list phù hợp. Đặt URI qua biến môi trường, không ghi URI hoặc mật khẩu vào mã nguồn hay Git:

```powershell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>/?retryWrites=true&w=majority"
docker compose up --build
```

Để thêm tối thiểu ba bản ghi mẫu vào Atlas hoặc MongoDB local, cấu hình `backend/.env` với `MONGODB_URI`, sau đó chạy `cd backend; npm ci; npm run seed`. Lệnh seed theo ISBN và chỉ thêm bản ghi còn thiếu, không ghi đè các bản ghi đã tồn tại.

## Chạy từng dịch vụ phát triển

1. Cài Node.js 22 trở lên và khởi động MongoDB local, hoặc chuẩn bị URI Atlas.
2. Tạo `backend/.env` từ `backend/.env.example`, cập nhật URI riêng.
3. Terminal 1: `cd backend; npm install; npm run dev`.
4. Terminal 2: `cd frontend; npm install; npm run dev`.
5. Mở `http://localhost:5173`. Vite proxy `/api` và `/health` đến backend cổng 5000.
6. Thêm ba sách mẫu bằng `cd backend; npm run seed`.

## Deploy lên Render

Repository có `render.yaml` để tạo Web Service API và Static Site frontend cùng lúc:

1. Trong Render Dashboard, tạo **Blueprint Instance** từ `s234876-ai/234876_NgoMinhNhat` và chọn nhánh `main`.
2. Khi Render yêu cầu biến bí mật chưa đồng bộ, nhập `MONGODB_URI` bằng connection string Atlas. Blueprint tự liên kết `CLIENT_URL` với host Static Site và `VITE_API_URL` với host API; ứng dụng tự chuẩn hóa host sang HTTPS.
3. API dùng Root Directory `backend`, build `npm ci`, start `npm start` và health check `/health`. Frontend dùng Root Directory `frontend`, build `npm ci && npm run build`, publish `dist`.
4. Đặt `MONGODB_DB=234876_NgoMinhNhat`; URI Atlas phải được giữ trong Environment của Render, không đưa vào repo. Trong Atlas, thêm IP access phù hợp để Render truy cập.
5. Mở API `/health`, sau đó frontend; thử thêm, tìm kiếm, cập nhật và xóa sách. CORS chỉ cho phép origin khai báo trong `CLIENT_URL`.

Nếu cấu hình thủ công thay vì Blueprint, dùng cùng các Root Directory, build/start commands và biến môi trường nêu trên.

## Docker Hub

`docker-compose.hub.yml` bổ sung tên image/tag cho Compose local. Để build và chạy thử image trên Docker Desktop, dùng URL API local:

```powershell
$env:VITE_API_URL = "http://localhost:5000"
docker compose -f docker-compose.yml -f docker-compose.hub.yml up --build
```

Kiểm tra `http://localhost:8080` và `http://localhost:5000/health`, sau đó dừng bằng `Ctrl+C`. Để đóng gói và push, đặt `VITE_API_URL` bằng URL HTTPS API đã deploy (không có dấu `/` cuối), đăng nhập account Docker Hub `nhat290305` trong Docker Desktop/CLI và chạy:

```powershell
$env:VITE_API_URL = "https://<api-render-url>"
docker compose -f docker-compose.yml -f docker-compose.hub.yml build
docker login -u nhat290305
docker compose -f docker-compose.yml -f docker-compose.hub.yml push
```

Image backend và frontend lần lượt được gắn tag `nhat290305/234876-ngominhnhat-backend:latest` và `nhat290305/234876-ngominhnhat-frontend:latest`. Docker CLI sẽ yêu cầu đăng nhập tương tác; không truyền access token trực tiếp trên dòng lệnh. Image frontend cần được build lại nếu URL API thay đổi.

## Tài nguyên cần điền khi nộp

- GitHub: URL repository sau khi push.
- MongoDB Atlas: database `234876_NgoMinhNhat`, collection `books` và URL/ảnh xác nhận cấu hình (không công khai credentials).
- Docker Hub: URL image sau khi push thành công.
- Render: URL frontend và backend đã deploy.

Các dịch vụ cloud cần quyền đăng nhập riêng của chủ tài khoản; không ghi URL dịch vụ chưa được tạo hoặc giả lập credentials.
